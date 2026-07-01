exports.handler = async (event) => {
  const { origin, destination } = event.queryStringParameters || {};
  if (!origin || !destination) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing params" }) };
  }
  const MAPS_KEY = "AIzaSyCx9nvzU8m7RlpIREuvNXT9o-pcGkK7lNI";
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=driving&key=${MAPS_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const secs = data?.rows?.[0]?.elements?.[0]?.duration?.value;
    const mins = secs ? Math.round(secs / 60) + 15 : 45;
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ mins })
    };
  } catch (e) {
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ mins: 45 })
    };
  }
};
