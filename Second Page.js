document.addEventListener('DOMContentLoaded', function() {
    const packersContainer = document.getElementById('packersContainer');
    const paginationContainer = document.getElementById('pagination');
    const enquiryForm = document.getElementById('enquiryForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const itemsPerPage = 4;
    let currentPage = 1;
    let totalPages = 0;
    let allPackers = [];
                                                                // The popup message section
    const popup = document.createElement('div');
    popup.style.cssText = `
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        z-index: 10000;
    `;
    document.body.appendChild(popup);

    function showPopup(message, isSuccess) {
        popup.textContent = message;
        popup.style.backgroundColor = isSuccess ? '#d4edda' : '#f8d7da';
        popup.style.color = isSuccess ? '#155724' : '#721c24';
        popup.style.display = 'block';
        loadingIndicator.style.display = 'none';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 3000);
    }

                                        //this function is for Fetch packers and movers data from the backend
    function fetchPackersAndMovers() {
        fetch('http://127.0.0.1:8000/api/packers-movers/?city=Delhi')
            .then(response => response.json())
            .then(data => {
                allPackers = data;
                totalPages = Math.ceil(allPackers.length / itemsPerPage);
                displayPackers(currentPage);
                displayPagination();
            })
            .catch(error => console.error('Error fetching packers data:', error));
    }

                                                    // once data is fatched now Display packers
    function displayPackers(page) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const packersToDisplay = allPackers.slice(start, end);

        packersContainer.innerHTML = '';
        packersToDisplay.forEach(packer => {
            const packerCard = createPackerCard(packer);
            packersContainer.appendChild(packerCard);
        });
        attachEnquiryListeners();
    }

                                                        // Create a card for each packer
    function createPackerCard(packer) {
        const card = document.createElement('div');
        card.className = 'col-md-6 mb-4';
        card.innerHTML = `
            <div class="packer-card">
                <div class="row">
                    <div class="col-md-9">
                        <h3>Name: ${packer.name}</h3>
                        <p>Address: ${packer.address}</p>
                        <p>Local Move: ${packer.local_move_cost_range}</p>
                        <p>Intercity Move: ${packer.intercity_move_cost_range}</p>
                        <p>Ratings & Reviews: ${packer.ratings}/5 (${packer.reviews_count}+ reviews)</p>
                    </div>
                    <div class="col-md-3 d-flex flex-column justify-content-between align-items-end">
                        <img src="${packer.img_url}" alt="${packer.name}" class="packer-image mb-2">
                        <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#enquiryModal" data-mover="${packer.name}">Send Enquiry</button>
                    </div>
                </div>
            </div>
        `;
        return card;
    }
    function displayPagination() {
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            paginationContainer.appendChild(li);
        }
        attachPaginationListeners();
    }

                                        // this function Attach pagination listeners on basis above code
    function attachPaginationListeners() {
        const pageLinks = document.querySelectorAll('.page-link');
        pageLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                currentPage = parseInt(this.getAttribute('data-page'));
                displayPackers(currentPage);
                displayPagination();
            });
        });
    }

    function attachEnquiryListeners() {
        const enquiryButtons = document.querySelectorAll('[data-bs-toggle="modal"]');
        const selectedMoverInput = document.getElementById('selectedMover');
        enquiryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const moverName = this.getAttribute('data-mover');
                selectedMoverInput.value = moverName;
            });
        });
    }

                                                            // This will handle enquiry form 
    enquiryForm.addEventListener('submit', function(e) {
        e.preventDefault();

                                                    // here we Prepare form data to be taken from the user
        const formData = {
            mover: document.getElementById('selectedMover').value,
            name: document.getElementById('name').value,
            mobile: document.getElementById('mobile').value,
            address: document.getElementById('address').value,
            message: document.getElementById('message').value
        };

        loadingIndicator.style.display = 'flex';

                                                            // Send form data to the backend server
        fetch('http://127.0.0.1:8000/api/contact/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            showPopup('Enquiry sent successfully!', true);
            document.getElementById('enquiryModal').querySelector('.btn-close').click();
            enquiryForm.reset();
        })
        .catch(error => {
            showPopup('Error sending enquiry: ' + error.message, false);
        })
        .finally(() => {
            loadingIndicator.style.display = 'none';
        });
    });
                                                        // this function featches data for movers and packers
    fetchPackersAndMovers();
});