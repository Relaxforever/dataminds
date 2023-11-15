'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import dataminds from '../../../public/dataminds.png'

const Video = () => {
  const router = useRouter();
  const searchParams = useSearchParams()
  const { videoId } = searchParams.get('videoId');
  const [videoData, setVideoData] = useState(null);
  const [allVideoData, setAllVideoData] = useState([]);
  


  useEffect(() => {
    const storedVideoData = localStorage.getItem('currentVideo');
    const allVideoData = localStorage.getItem('allvideosRecommended');``
    if (storedVideoData) {
      setVideoData(JSON.parse(storedVideoData));
    } else {
      // Optionally, fetch from the API if not found in local storage
      // fetchVideoData(videoId);
    }
    if (allVideoData) {
      setAllVideoData(JSON.parse(allVideoData));
    } else {
      // Optionally, fetch from the API if not found in local storage
      // fetchVideoData(videoId);
    }
  }, [videoId]);

  if (!videoData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  const formattedDate = new Date(videoData.publish_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });


  const handleVideoClick = (videoData) => {
    localStorage.setItem('currentVideo', JSON.stringify(videoData));
    localStorage.setItem('allvideosRecommended' , JSON.stringify(allVideoData));
    router.push(`/video/?videoId=${videoData.views}`);
  };


  return (
    <section className="w-[64rem]  px-6 py-8 mx-auto bg-white dark:bg-gray-900">
      <header>
      <Image 
        src={dataminds}
        alt="Ares by Dataminds Logo" 
        width={60}
        height={20}
      />
      </header>

      <main className="mt-8">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">{videoData.title}</h2>

        <div className="mt-4 text-gray-600 dark:text-gray-300">
          <p>Published on: {formattedDate}</p>
          <p>Views: {videoData.views}</p>
        </div>

        <p className="mt-2 leading-loose text-gray-600 dark:text-gray-300">
          {videoData.text}
        </p>

        <iframe 
          className="w-full h-[30rem] my-10 rounded-lg " 
          src={`${videoData.url.replace('watch?v=', 'embed/')}?start=${Math.floor(videoData.start)}`} 
          title={videoData.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen>
        </iframe>
        
        <p className="text-gray-600 dark:text-gray-300">
          {/* Any additional text */}
          {/* You can add more content here if needed */}
        </p>
        <div className="mt-10">
        <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Similar Videos of the Query You Made</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allVideoData.map((video, index) => (
            <div key={index} className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700" onClick={handleVideoClick(video)}>
              <div className="p-5">
                <a >
                  <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{video.title}</h5>
                </a>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{video.text}</p>

              </div>
            </div>
          ))}
        </div>
      </div>


      </main>
      
    </section>
  );
};

export default Video;

