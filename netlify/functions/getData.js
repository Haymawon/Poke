// netlify/functions/getData.js
import fetch from "node-fetch";

export async function handler(event, context) {
  const GIPHY_KEY = process.env.GIPHY_KEY;
  const PIXABAY_KEY = process.env.PIXABAY_KEY;


  const giphyResponse = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=5`);
  const giphyData = await giphyResponse.json();

 
  const pixabayResponse = await fetch(`https://pixabay.com/api/?key=${PIXABAY_KEY}&q=cats&image_type=photo&per_page=5`);
  const pixabayData = await pixabayResponse.json();

  return {
    statusCode: 200,
    body: JSON.stringify({ giphy: giphyData, pixabay: pixabayData })
  };
}