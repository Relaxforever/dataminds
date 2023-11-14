// pages/VideoDetails.js
import { useRouter } from 'next/router';

export default function VideoDetails() {
  const router = useRouter();
  const { title, url, views } = router.query;

  return (
    <div className="container">
      <iframe 
        className="w-full h-96"
        src={url}
        title={title}
        frameBorder="0"
        allowFullScreen>
      </iframe>
      <div>
        <h1>{title}</h1>
        <p>{views} views</p>
        {/* Add more information as needed */}
      </div>
    </div>
  );
}
