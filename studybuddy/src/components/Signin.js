// import React, { useState } from 'react';
// import axios from 'axios';

// const Signin = () => {
//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//     });

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         try {
//             const response = await axios.post('http://localhost:5000/signin', {
//                 email: formData.email,
//                 password: formData.password,
//             });
//             alert(response.data.message); // Display the message from the backend

//             // Redirect or handle success as needed
//         } catch (error) {
//             alert('Signin failed');
//             console.error(error);
//         }
//     };

//     return (
//         <div>
//             <h2>Signin</h2>
//             <form onSubmit={handleSubmit}>
//                 <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
//                 <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
//                 <button type="submit">Signin</button>
//             </form>
//         </div>
//     );
// };

// export default Signin;
import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation

const Signin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const history = useHistory(); // Create history object for navigation

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/signin', {
                email: formData.email,
                password: formData.password,
            });

            alert(response.data.message); // Display the message from the backend

            // Check the HTTP status code to decide navigation
            if (response.status === 200) {
                history.push('/quiz'); // Redirect to Quiz page on success
            }
        } catch (error) {
            if (error.response) {
                // Handle the case where the server returns a response outside the 2xx range
                alert(error.response.data.message);
            } else {
                // Handle other errors like network issues
                alert('Signin failed due to network issues');
                console.error(error);
            }
        }
    };

    return (
        <div>
            <h2>Signin</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Signin</button>
            </form>
        </div>
    );
};

export default Signin;
