                                                        // DOM Content Loaded Event Listener
document.addEventListener('DOMContentLoaded', function() {
                                                            // DOM Element Selectors
    const packersContainer = document.getElementById('packersContainer');
    const paginationContainer = document.getElementById('pagination');
    const enquiryForm = document.getElementById('enquiryForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const costCalculatorButton = document.getElementById('costCalculatorButton');
    const costCalculator = document.getElementById('costCalculator');
    const minimizeCalculator = document.getElementById('minimizeCalculator');
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const editProfileForm = document.getElementById('editProfileForm');
    const logoutButton = document.getElementById('logoutButton');

                                                    // Constants used
    const itemsPerPage = 4;
    const questions = [
        "What's the distance of your move in km?",
        "What's your source location?",
        "What's your destination location?",
        "What's the volume of items to be shifted (in cubic feet)?",
        "What's the approximate weight of items (in kg)?",
        "Are there any fragile or antique items? (Yes/No)",
        "Do you need insurance coverage? (Yes/No)",
        "Do you need storage services? (Yes/No)",
        "How many laborers do you think you'll need?"
    ];

                                                    // Variables used
    let currentPage = 1;
    let totalPages = 0;
    let allPackers = [];
    let currentQuestion = 0;
    let answers = {};

                                            // Create a Popup Message Element
    const popup = createPopupElement();
    document.body.appendChild(popup);

                                            //This will fetch Packers and Movers Data
    fetchPackersAndMovers();

                                                        // Event Listeners
    enquiryForm.addEventListener('submit', handleEnquirySubmit);
    costCalculatorButton.addEventListener('click', toggleCostCalculator);
    minimizeCalculator.addEventListener('click', toggleCostCalculator);
    sendButton.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', handleEnterKey);
    editProfileForm.addEventListener('submit', handleProfileUpdate);
    logoutButton.addEventListener('click', handleLogout);

                                                // Start the Cost Estimator conversation
    initializeCostEstimator();

                                                            // Functions

    function createPopupElement() {
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
        return popup;
    }

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

    function handleEnquirySubmit(e) {
        e.preventDefault();

        const formData = {
            mover: document.getElementById('selectedMover').value,
            name: document.getElementById('name').value,
            mobile: document.getElementById('mobile').value,
            address: document.getElementById('address').value,
            message: document.getElementById('message').value
        };

        loadingIndicator.style.display = 'flex';

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
    }

    function toggleCostCalculator() {
        if (costCalculator.style.display === 'none' || costCalculator.style.display === '') {
            costCalculator.style.display = 'flex';
            costCalculatorButton.style.display = 'none';
        } else {
            costCalculator.style.display = 'none';
            costCalculatorButton.style.display = 'flex';
        }
    }

    function addMessage(message, isUser = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
        messageElement.textContent = message;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function askQuestion() {
        if (currentQuestion < questions.length) {
            addMessage(questions[currentQuestion]);
        } else {
            calculateCost();
        }
    }

    function calculateCost() {
        let baseCost = 1000;
        let distanceCost = parseInt(answers[0]) * 10;
        let volumeCost = parseInt(answers[3]) * 5;
        let weightCost = parseInt(answers[4]) * 2;
        let fragileCost = answers[5].toLowerCase() === 'yes' ? 500 : 0;
        let insuranceCost = answers[6].toLowerCase() === 'yes' ? 1000 : 0;
        let storageCost = answers[7].toLowerCase() === 'yes' ? 2000 : 0;
        let laborCost = parseInt(answers[8]) * 500;

        let totalCost = baseCost + distanceCost + volumeCost + weightCost + fragileCost + insuranceCost + storageCost + laborCost;

        addMessage(`Based on your inputs, the estimated cost of your move is approximately ₹${totalCost}. Please note that this is a rough estimate and the actual cost may vary. For a more accurate quote, please contact our customer service.`);
    }

    function handleUserInput() {
        const userAnswer = userInput.value.trim();
        if (userAnswer) {
            addMessage(userAnswer, true);
            answers[currentQuestion] = userAnswer;
            currentQuestion++;
            askQuestion();
            userInput.value = '';
        }
    }

    function handleEnterKey(e) {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    }

    function initializeCostEstimator() {
        addMessage("Welcome to our Cost Estimator! I'll ask you a few questions to provide an estimate for your move.");
        askQuestion();
    }

    function handleProfileUpdate(e) {
        e.preventDefault();
        const name = document.getElementById('editName').value;
        const email = document.getElementById('editEmail').value;
        const password = document.getElementById('editPassword').value;

        console.log('Profile updated:', { name, email, password });
        showPopup('Profile updated successfully!', true);
        $('#editProfileModal').modal('hide');
    }

    function handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = 'first.html';
    }

    function populateEnquiries() {
        const enquiriesList = document.getElementById('enquiriesList');
        const mockEnquiries = [
            { mover: 'Mover 1', message: 'Enquiry 1', time: '2024-03-19 10:00' },
            { mover: 'Mover 2', message: 'Enquiry 2', time: '2024-03-18 15:30' },
        ];

        enquiriesList.innerHTML = mockEnquiries.map(enquiry => `
            <div class="enquiry-item">
                <h5>${enquiry.mover}</h5>
                <p>${enquiry.message}</p>
                <small>${enquiry.time}</small>
            </div>
        `).join('');
    }

                                            // This will be used to call populate enquiries when the enquiries modal is shown
    $('#enquiriesModal').on('show.bs.modal', populateEnquiries);
});