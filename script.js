

document.addEventListener('DOMContentLoaded', () => {
    
    const uploadArea = document.getElementById('uploadArea');
    const uploadModal = document.getElementById('uploadModal');
    const modalImageInput = document.getElementById('modalImageInput');
    const dropZone = document.getElementById('dropZone');
    const closeModal = document.querySelector('.close');
    const productContainer = document.getElementById('productContainer');
    const textInput = document.getElementById('textInput');

    let base64String = '';

    // API configuration
    const HAWKSEARCH_API_URL = "https://searchapi-dev.hawksearch.net/api/v2/search";
    const CLIENT_GUID = "9ab847bd5c284113a22bbf917c7ac446";
    const K_VALUE = 3;

    // Open the modal when the upload icon is clicked
    uploadArea.addEventListener('click', () => {
        uploadModal.style.display = 'block';
    });

    // Close the modal when the close button is clicked
    closeModal.addEventListener('click', () => {
        uploadModal.style.display = 'none';
    });

    // Close the modal if the user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === uploadModal) {
            uploadModal.style.display = 'none';
        }
    });

    // Open file input when clicking the drop zone
    dropZone.addEventListener('click', () => {
        modalImageInput.click();
    });

    // Handle file selection
    modalImageInput.addEventListener('change', handleFileSelect);

    // Handle file select and convert to base64
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                base64String = reader.result.split(',')[1];
                uploadModal.style.display = 'none';
                fetchProductsByImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    }

    // Handle drag and drop functionality
    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = event.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                base64String = reader.result.split(',')[1];
                uploadModal.style.display = 'none';
                fetchProductsByImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    });

    // Fetch products using image search
    async function fetchProductsByImage(base64String) {
        const jsonData = {
            ClientGuid: CLIENT_GUID,
            RequestType: "ImageSearch",
            kValue: K_VALUE,
            ImageData: base64String
        };

        try {
            const response = await fetch(HAWKSEARCH_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            displayProducts(data.Results);
        } catch (error) {
            console.error("Error fetching products by image:", error);
        }
    }

    // Handle text search on 'Enter' key press
    textInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            fetchProductsByText(textInput.value);
        }
    });

    // Fetch products using text search
    async function fetchProductsByText(keyword) {
        const jsonData = {
            ClientGuid: CLIENT_GUID,
            RequestType: "ConceptSearch",
            kValue: K_VALUE,
            Keyword: keyword

        };

        try {
            const response = await fetch(HAWKSEARCH_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            displayProducts(data.Results);
        } catch (error) {
            console.error("Error fetching products by text:", error);
        }
    }

    // Function to display products
    function displayProducts(products) {
        productContainer.innerHTML = '';

        if (!products || products.length === 0) {
            productContainer.textContent = 'No products found';
            return;
        }

        products.forEach((item) => {
            const Document = item.Document;

            const productDiv = document.createElement('div');
            productDiv.classList.add('product');

            const img = document.createElement('img');
            img.src = Document.image[0];
            img.alt = Document.title[0];
            img.onerror = () => {
                img.src = 'placeholder.png';
            };

            const title = document.createElement('h2');
            title.classList.add('product-title');
            title.textContent = Document.title[0];

            const price = document.createElement('p');
            price.classList.add('product-price');
            price.textContent = `$${Document.price[0]}`;

            productDiv.appendChild(img);
            productDiv.appendChild(title);
            productDiv.appendChild(price);
            productContainer.appendChild(productDiv);
        });
    }
});
