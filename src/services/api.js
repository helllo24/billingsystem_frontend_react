// API Service Client for Billing Voice System

const getBaseUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
        return 'http://localhost:8080';
    }
    // Fallback production URL if deployed
    return 'https://billingsystem-backend-2.onrender.com'; 
};

export const API = {
    baseUrl: getBaseUrl(),

    // Submit text billing request
    async generateBillFromText(text) {
        const url = `${this.baseUrl}/Bill/askBill`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            throw new Error(`Billing API error: ${response.statusText}`);
        }
        return await response.json();
    },

    // Submit audio billing request (voice upload)
    async generateBillFromVoice(audioBlob) {
        const url = `${this.baseUrl}/Bill/askvoiceBill`;
        const formData = new FormData();
        // The backend expects @RequestParam("file") MultipartFile file
        formData.append('file', audioBlob, 'voice_bill.wav');

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Voice Billing API error: ${response.statusText}`);
        }
        return await response.json();
    },

    // Fetch Bill details by ID
    async getBillById(billId) {
        const url = `${this.baseUrl}/Bill/${billId}`;
        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Invoice lookup failed: ${response.statusText}`);
        }
        return await response.json();
    },

    // Fetch all Invoices from the database
    async getAllInvoices() {
        const url = `${this.baseUrl}/Bill`;
        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch invoices: ${response.statusText}`);
        }
        return await response.json();
    },

    // Upload a pre-recorded audio file and parse it
    async uploadAudioFile(file) {
        const url = `${this.baseUrl}/Bill/upload-audio`;
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Audio upload failed: ${response.statusText}`);
        }
        return await response.json();
    },

    // Download PDF Blob
    async downloadBillPdf(billId, filename = 'invoice.pdf') {
        const url = `${this.baseUrl}/Bill/pdf/${billId}`;
        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Failed to download PDF: ${response.statusText}`);
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
    }
};
