from flask import Flask, request, jsonify
import gdown
import pandas as pd
from tqdm import tqdm
from pytube import YouTube
import whisper
from sentence_transformers import SentenceTransformer, util
import chromadb

app = Flask(__name__)

# Initialization
model = whisper.load_model("base")
sentence_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
client = chromadb.Client()
collection = client.create_collection('pycon')
MAX_BATCH_SIZE = 166

@app.route('/')
def index():
    return "Welcome to the YouTube Video Query API!"

@app.route('/metadata', methods=['POST'])
def get_metadata():
    data = request.json
    url = data.get('url')
    yt = YouTube(url)
    metadata = {
        "views": yt.views,
        "author": yt.author,
        "publish_date": yt.publish_date,
        "keywords": yt.keywords
    }
    return jsonify(metadata)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    data = request.json
    audio_path = data.get('audio_path')
    result = model.transcribe(audio_path)
    return jsonify(result)

@app.route('/process_transcriptions', methods=['GET'])
def process_transcriptions():
    # Read the CSV file directly from the local directory
    df_transcribes = pd.read_csv('all_transcribes.csv', sep='|')

    # Process transcriptions and create overlapping windows
    new_data = []
    window = 6
    stride = 3

    for i in range(0, len(df_transcribes), stride):
        i_end = min(len(df_transcribes)-1, i+window)
        if df_transcribes.iloc[i]['title'] != df_transcribes.iloc[i_end]['title']:
            continue
        text = ' '.join(df_transcribes[i:i_end]['text'])
        new_data.append({
            'start': df_transcribes.iloc[i]['start'],
            'end': df_transcribes.iloc[i_end]['end'],
            'title': df_transcribes.iloc[i]['title'],
            'views': df_transcribes.iloc[i]['views'],
            'publish_date': df_transcribes.iloc[i]['publish_date'],
            'keywords': df_transcribes.iloc[i]['keywords'],
            'text': text,
            'id': df_transcribes.iloc[i]['position'],
            'url': df_transcribes.iloc[i]['url']
        })

    df_overlap = pd.DataFrame(new_data)

    # Generate embeddings
    embeddings = sentence_model.encode(df_overlap['text'], batch_size=64)
    df_overlap['embeddings'] = embeddings.tolist()

    df_overlap['id_database'] = df_overlap.apply(lambda x : str(hash(x['title']))+ '-'+ str(x['id']), axis=1)
    
    for i in range(0, len(df_overlap), MAX_BATCH_SIZE):
        batch = df_overlap.iloc[i:i+MAX_BATCH_SIZE]
        collection.add(
            ids=batch['id_database'].tolist(),
            embeddings=batch['embeddings'].tolist(),
            metadatas=batch[['start', 'end', 'text', 'views', 'publish_date', 'url']].to_dict('records')
        )

    return jsonify({"message": "Transcriptions processed and embeddings generated.", "data": df_overlap.to_dict(orient='records')})


@app.route('/query_database', methods=['POST'])
def query_database():
    data = request.json
    query_texts = data.get('query_texts')
    content = collection.query(query_texts=query_texts, n_results=5)
    return jsonify(content)

if __name__ == '__main__':
    with app.app_context():
        print(process_transcriptions())
    app.run(debug=True)
