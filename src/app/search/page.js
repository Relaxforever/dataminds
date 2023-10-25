import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Search() {
  const [results, setResults] = useState([]);
  const router = useRouter();
  
  useEffect(() => {
    if (router.isReady) {
      const fetchResults = async () => {
        try {
          const response = await fetch("http://localhost:5000/query_database", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query_texts: router.query.q,
            }),
          });

          const data = await response.json();
          setResults(data);

        } catch (error) {
          console.error("Error fetching results:", error);
        }
      };

      fetchResults();
    }
  }, [router.isReady]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-4 bg-white rounded shadow-lg">
        {results.map((result, index) => (
          <div key={index} className="border-b p-2">
            {result.title} 
            {/* Add other details from your result here */}
          </div>
        ))}
      </div>
    </div>
  );
}
