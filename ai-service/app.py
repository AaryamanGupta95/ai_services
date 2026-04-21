from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import importlib.util
import os

# Robust import:
# Some Python distributions (including embedded Python) may not resolve local modules
# from the current working directory. Load model.py by absolute path instead.
_HERE = os.path.dirname(os.path.abspath(__file__))
_MODEL_PATH = os.path.join(_HERE, "model.py")
_spec = importlib.util.spec_from_file_location("ai_model", _MODEL_PATH)
_model = importlib.util.module_from_spec(_spec)
assert _spec and _spec.loader
_spec.loader.exec_module(_model)
get_best_provider = _model.get_best_provider

app = Flask(__name__)
CORS(app)

@app.route('/predict-provider', methods=['POST'])
def predict_provider():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400
            
        customer = data.get('customer')
        providers = data.get('providers')
        
        if not customer or not providers:
            return jsonify({"error": "Missing customer or providers data"}), 400
            
        best_provider, score = get_best_provider(customer, providers)
        
        if not best_provider:
             return jsonify({"error": "No suitable provider found"}), 404
             
        return jsonify({
            "best_provider_id": best_provider.get('id'),
            "score": score
        })

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
