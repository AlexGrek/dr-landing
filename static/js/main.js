document.addEventListener('DOMContentLoaded', function() {
    loadAvailableTickets();
    setupFormHandler();
});

function loadAvailableTickets() {
    fetch('/api/tickets/available')
        .then(response => response.json())
        .then(data => {
            const element = document.getElementById('available-tickets');
            element.textContent = data.available || '0';
        })
        .catch(error => {
            console.error('Error loading tickets:', error);
            document.getElementById('available-tickets').textContent = 'Error loading';
        });
}

function setupFormHandler() {
    const form = document.getElementById('bookingForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            guests: parseInt(document.getElementById('guests').value)
        };

        try {
            const response = await fetch('/api/tickets/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            const messageDiv = document.getElementById('message');

            if (response.ok) {
                messageDiv.textContent = 'Booking successful! Check your email for confirmation.';
                messageDiv.className = 'message success';
                form.reset();
                loadAvailableTickets();
            } else {
                messageDiv.textContent = 'Booking failed. Please try again.';
                messageDiv.className = 'message error';
            }
        } catch (error) {
            console.error('Error:', error);
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = 'An error occurred. Please try again.';
            messageDiv.className = 'message error';
        }
    });
}
