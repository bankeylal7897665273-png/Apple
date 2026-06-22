from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    # Render assigns a port dynamically, but we bind to 10000 for local testing alongside Docker
    app.run(host='0.0.0.0', port=10000, debug=True)
