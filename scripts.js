document.getElementById('transaction-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const user_id = document.getElementById('user_id').value;
  const amount = document.getElementById('amount').value;
  const type = document.getElementById('type').value;

  if (!user_id || !amount || !type) {
      document.getElementById('response').innerText = 'All fields are required';
      return;
  }

  try {
      const response = await fetch('/transaction', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: parseInt(user_id), amount: parseFloat(amount), type }),
      });

      const data = await response.json();
      document.getElementById('response').innerText = `Transaction ID: ${data.id}`;
  } catch (error) {
      document.getElementById('response').innerText = 'Error processing transaction';
  }
});
