//     import React, { useState } from 'react';
//     import axios from 'axios';
//     import { useNavigate } from 'react-router-dom';

//     const Signup = () => {
//         const [formData, setFormData] = useState({
//             email: '',
//             password: '',
            
//             firstName: '',
//             lastName: '',
//         });

//         const [errors, setErrors] = useState({});

//         const navigate = useNavigate();

//         const handleChange = (e) => {
            
//             const { name, value } = e.target;
//             setFormData(prev => ({ ...prev, [name]: value }));
        
//             let newErrors = { ...errors };
        
//             if (name === 'email') {
//                 if (!value) {
//                     newErrors.email = 'Email is required';
//                 } else if (!/\S+@\S+\.\S+/.test(value)) {
//                     newErrors.email = 'Invalid email format';
//                 } else {
//                     delete newErrors.email;
//                 }
//             }
        
//             if (name === 'password') {
//                 if (value.length < 6) {
//                     newErrors.password = 'Password must be at least 6 characters long';
//                 } else {
//                     delete newErrors.password;
//                 }
//             }
        
//             setErrors(newErrors);
//         };
        

//         const handleSubmit = async (e) => {
//             console.log("testing")
//             e.preventDefault();
        
            
        
//             if (Object.keys(errors).length === 0 && formData.email && formData.password.length >= 6) {
//                 try {
                    
//                     const response = await axios.post('http://localhost:5000/signup', formData);
                    
//                     alert('Signup successful');
//                     navigate('/');
//                 } catch (error) {
//                     console.error('Signup failed:', error);
//                     setErrors({ backend: (error.response && error.response.data.message) || 'Network or other error' });
//                 }
//             }
//         };
        
        

//         return (
//             <div>
//                 <h2>Signup</h2>
//                 <form onSubmit={(e) => {
//     e.preventDefault();
//     handleSubmit(e);
// }}>

//                     <input type="email" name="email" value={formData.email} placeholder="Email" onChange={handleChange} style={{ borderColor: errors.email ? 'red' : 'initial' }} required />
//                     {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
//                     <input type="password" name="password" value={formData.password} placeholder="Password" onChange={handleChange} style={{ borderColor: errors.password ? 'red' : 'initial' }} required />
//                     {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
                    
//                     <input type="text" name="firstName" value={formData.firstName} placeholder="First Name" onChange={handleChange} required />
//                     <input type="text" name="lastName" value={formData.lastName} placeholder="Last Name" onChange={handleChange} required />
//                     <button type="submit">Signup</button>
                    
//                 </form>
//             </div>
//         );
//     };

//     export default Signup;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });

    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        let newErrors = { ...errors };

        if (name === 'email') {
            if (!value) {
                newErrors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(value)) {
                newErrors.email = 'Invalid email format';
            } else {
                delete newErrors.email;
            }
        }

        if (name === 'password') {
            if (value.length < 6) {
                newErrors.password = 'Password must be at least 6 characters long';
            } else {
                delete newErrors.password;
            }
        }

        setErrors(newErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Object.keys(errors).length === 0 && formData.email && formData.password.length >= 6) {
            try {
                const response = await axios.post('http://localhost:5000/signup', formData);
                console.log(response.data); // Log the response data
                alert('Signup successful');
                navigate('/');
            } catch (error) {
                console.error('Signup failed:', error);
                setErrors({ backend: (error.response && error.response.data.message) || 'Network or other error' });
            }
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Email"
                    onChange={handleChange}
                    style={{ borderColor: errors.email ? 'red' : 'initial' }}
                    required
                />
                {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
                
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    placeholder="Password"
                    onChange={handleChange}
                    style={{ borderColor: errors.password ? 'red' : 'initial' }}
                    required
                />
                {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
                
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    placeholder="First Name"
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    placeholder="Last Name"
                    onChange={handleChange}
                    required
                />
                <button type="submit">Signup</button>
            </form>
        </div>
    );
};

export default Signup;
