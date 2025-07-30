from flask import Flask, jsonify, request
app = Flask(__name__)

@app.route('/api/quote')
def quote():
    return jsonify({"quote": "Keep learning, keep growing!"})

@app.route('/api/weather')
def weather():
    city = request.args.get("city", "Varanasi")
    return jsonify({"city": city, "temp": 34})

app.run()