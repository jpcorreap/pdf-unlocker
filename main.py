from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader, PdfWriter
import io
import base64


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/unlock-pdf', methods=['POST'])
def unlock_pdf():
    print("Entró 1")
    try:
        print("Entró 2")
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
        if not pdf_reader.is_encrypted:
            return jsonify({'error': 'PDF is not encrypted'}), 400

        # Try to decrypt the PDF with the provided password
        if not pdf_reader.decrypt(password):
            return jsonify({'error': 'Incorrect password'}), 400

        print("Ya lo desbloqueó")
        
        # Create a new PDF writer object to write the unlocked PDF
        pdf_writer = PdfWriter()
        for page_num in range(len(pdf_reader.pages)):
            pdf_writer.add_page(pdf_reader.pages[page_num])

        # Write the unlocked PDF to a BytesIO object
        unlocked_pdf_stream = io.BytesIO()
        pdf_writer.write(unlocked_pdf_stream)
        unlocked_pdf_stream.seek(0)

        # Return the unlocked PDF
        print("Entró 2")
        
        # Encode the unlocked PDF to base64
        unlocked_pdf_base64 = base64.b64encode(unlocked_pdf_stream.read()).decode('utf-8')

        return jsonify({'pdf': unlocked_pdf_base64})
        return send_file(unlocked_pdf_stream, as_attachment=True, download_name='unlocked.pdf', mimetype='application/pdf')

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3001)
