document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/buckets');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const buckets = await response.json();

        const selectElement = document.getElementById('bucket-select');

        for (const bucket of buckets) {
            const optionElement = document.createElement('option');
            optionElement.value = bucket.bucketId;
            optionElement.text = bucket.name;
            selectElement.appendChild(optionElement);
        }
    } catch (error) {
        console.error(error);
    }
});

document.getElementById('search-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const query = document.getElementById('search-input').value;
    const bucketId = document.getElementById('bucket-select').value;

    try {
        const response = await fetch('http://localhost:3000/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, bucketId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const llmText = await response.json();

        const completionResponse = await fetch('http://localhost:3000/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ llmText, queryString: query }),
        });

        if (!completionResponse.ok) {
            throw new Error(`HTTP error! status: ${completionResponse.status}`);
        }

        const completionResult = await completionResponse.json();

        document.getElementById('result').innerText = completionResult;
    } catch (error) {
        console.error(error);
    }
});

function getDocuments(bucketId) {
    fetch(`/api/documents/${bucketId}`)
        .then(response => response.json())
        .then(documents => {
            const documentsDiv = document.getElementById('documents');
            documentsDiv.innerHTML = '';
            documents.forEach((doc) => {
                const p = document.createElement('p');
                p.textContent = doc.fileName; // Access the fileName property of the document object
                documentsDiv.appendChild(p);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

const bucketSelect = document.getElementById('bucket-select');
bucketSelect.addEventListener('change', (event) => {
    const selectedBucketId = event.target.value;
    getDocuments(selectedBucketId);
});