from flask import Flask, request, send_file, jsonify, send_from_directory
from flask_cors import CORS
from PyPDF2 import PdfReader, PdfWriter
import io
import base64
import os


app = Flask(__name__, static_folder='front/build')
CORS(app)  # Enable CORS for all routes

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/unlock-pdf', methods=['POST'])
def unlock_pdf():
    try:
        pdf_base64 = request.json.get('pdf')
        password = request.json.get('password')
        print(password)

        # Remove the 'data:application/pdf;base64,' prefix if it exists
        if pdf_base64.startswith("data:application/pdf;base64,"):
            pdf_base64 = pdf_base64[len("data:application/pdf;base64,"):]

        # Read the PDF file
        buffer=base64.b64decode(pdf_base64)
        f=io.BytesIO(buffer)
        pdf_reader = PdfReader(f)

        # Check if the PDF is encrypted
        if pdf_reader.is_encrypted:
            print('PDF is encrypted. Analyzing password.')

            # Try to decrypt the PDF with the provided password
            if not pdf_reader.decrypt(password):
                print('Incorrect password')
                return jsonify({'error': 'Incorrect password'}), 400

        # Create a new PDF writer object to write the unlocked PDF
        pdf_writer = PdfWriter()
        for page_num in range(len(pdf_reader.pages)):
            pdf_writer.add_page(pdf_reader.pages[page_num])

        # Write the unlocked PDF to a BytesIO object
        unlocked_pdf_stream = io.BytesIO()
        pdf_writer.write(unlocked_pdf_stream)
        unlocked_pdf_stream.seek(0)

        # Return the unlocked PDF
        
        # Encode the unlocked PDF to base64
        unlocked_pdf_base64 = base64.b64encode(unlocked_pdf_stream.read()).decode('utf-8')

        return jsonify({'pdf': unlocked_pdf_base64})

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3001)
