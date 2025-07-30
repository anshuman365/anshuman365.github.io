const API_BASE = "https://antibodies-usual-header-emily.trycloudflare.com";  // Change this

async function getQuote() {
  const res = await fetch(`${API_BASE}/api/quote`);
  const data = await res.json();
  document.getElementById("responseArea").innerText = "Quote: " + data.quote;
}

async function getWeather() {
  const res = await fetch(`${API_BASE}/api/weather?city=Varanasi`);
  const data = await res.json();
  document.getElementById("responseArea").innerText = "Weather: " + data.temp + "°C";
}