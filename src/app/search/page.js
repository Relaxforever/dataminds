'use client'
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'

export default function Search() {
  const [results, setResults] = useState([]);
  const searchParams = useSearchParams()
  const [error, setError] = useState(null);  // Error state

  useEffect(() => {
      const fetchResults = async () => {
        try {
          const response = await fetch("http://localhost:5000/query_database", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query_texts: searchParams.get('q'),
            }),
          });

          const data = await response.json();
          setResults(data.metadatas[0]);
          console.log( data.metadatas[0].map((result, index) => (result)))
          const search = searchParams.get('q')
          console.log(search)

        } catch (error) {
          console.error("Error fetching results:", error);
          setError(error.toString());  // Set error state
        }
      };

      fetchResults();
     
  }, []);



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-4 bg-white rounded shadow-lg">
        {error && <div className="text-red-500 p-2">{error}</div>} 
        {results.length > 0 && results.map((result, index) => (
          <div key={index} className="border-b p-2">
            <div className="relative border p-4 rounded-lg">
              <iframe 
                className="w-full h-64 rounded" 
                src={result.url.replace('watch?v=', 'embed/')} 
                title={result.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen>
              </iframe>
              <div className="absolute top-0 left-0 p-2 bg-white bg-opacity-75">
                <div className="text-xl font-bold">{result.title}</div>
                <div className="text-gray-700">{result.views} views</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-4 bg-white rounded shadow-lg">
        {error && <div className="text-red-500 p-2">{error}</div>}  
        {results.length > 0 ? results.map((elem, index) => (
          <div key={index} className="border-b p-2">
            <div className="text-xl font-bold">{elem.title}</div>
            <a href={elem.url} className="text-xl font-bold">{elem.url}</a>  
            {/* Add other details from your result here */}
          </div>
        )) : <div className="text-xl font-bold">No results found</div>}
      </div>
    </div>
  );
}
