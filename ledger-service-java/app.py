
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/ledger', methods=['POST'])
def ledger():
    data = request.json
    print(f"Transaction recorded: {data}")
    return jsonify({'status': 'Transaction recorded', 'data': data})

if __name__ == '__main__':
    app.run(port=5003, host='0.0.0.0')
