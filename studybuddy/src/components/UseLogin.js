
import React, { useState } from 'react';
import { Container, Grid, TextField, Button, Typography, Link, Box } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './image.jpeg';

const BackgroundImage = styled(Box)({
  backgroundSize: 'cover',
  backgroundPosition: 'left',
  height: '98vh',
});

const FormContainer = styled(Container)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '98vh',
});

const FormBox = styled(Box)({
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
  overflow: 'hidden',
});

// const CustomButton = styled(Button)({
//   width: '100%',
//   marginTop: '1.5rem',
//   padding: '0.5rem',
//   borderRadius: '5px',
//   backgroundColor: '#6a1b9a',
//   '&:hover': {
//     backgroundColor: '#4a148c',
//   },
// });

const UseLogin = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  // const handleToggle = () => {
  //   setIsSignUp(!isSignUp);
  // };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/signup', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      console.log(response.data);
      navigate('/Quiz');
    } catch (error) {
      console.error(error.response.data);
    }
  };

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
    setErrorMessage(''); 
    setPassword('');
    setEmail('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/signin', {
        email,
        password,
      });
  
      // Store the token in localStorage
      localStorage.setItem('authToken', response.data.token);
  
      console.log(response.data);
      navigate('/Dashboard');
      setErrorMessage('');  // Clear any previous error messages on successful login
    } catch (error) {
      console.error(error.response.data);
      setErrorMessage('Invalid email or password entered.');  // Set error message if login fails
    }
  };
  

  const CustomButton = styled(Button)({
    width: '100%',
    marginTop: '1.5rem',
    padding: '0.5rem',
    borderRadius: '5px',
    backgroundColor: '#87247f', // New color
    '&:hover': {
      backgroundColor: '#6f1d64', // Darker shade for hover state
    },
  });

  return (
    <Box sx={{ height: '100vh' }}>
      <Container maxWidth="xl" sx={{ height: '100%', alignItems: 'center' }}>
        <Grid container sx={{ height: '100%', alignItems: 'center' }}>
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' }, justifyContent: 'center', alignItems: 'center' }}>
            <Box>
              <img src={backgroundImage} alt='login image' style={{ width: '100%', maxWidth: '90%' }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <FormBox sx={{ width: '80%', maxWidth: '100%'}}>
              <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ 
        fontSize: '40px',
        color: '#7d2e8c' ,
        fontFamily: 'Poppins, sans-serif',
          // Increase the font size
        fontWeight: 'bold' // Make the font weight bold
    }}>Study Buddy</Typography>
              <Typography variant="h5" component="h2" gutterBottom align="center" sx={{fontFamily: 'Poppins, sans-serif'}}>{isSignUp ? 'Create an Account' : 'Start Learning Today!'}</Typography>
              <form noValidate onSubmit={isSignUp ? handleSignUp : handleSignIn}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    '& label.Mui-focused': {
                      color: '#6a1b9a',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#6a1b9a',
                      },
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    '& label.Mui-focused': {
                      color: '#6a1b9a',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#6a1b9a',
                      },
                    },
                  }}
                />
                {errorMessage && (
  <Typography color="error" align="center">
    {errorMessage}
  </Typography>
)}
                {isSignUp && (
                  <>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="firstName"
                      label="First Name"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      sx={{
                        '& label.Mui-focused': {
                          color: '#6a1b9a',
                        },
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#6a1b9a',
                          },
                        },
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="lastName"
                      label="Last Name"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      sx={{
                        '& label.Mui-focused': {
                          color: '#6a1b9a',
                        },
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#6a1b9a',
                          },
                        },
                      }}
                    />
                  </>
                )}
                <CustomButton
                  type="submit"
                  variant="contained"
                  sx={{ mt: 2, mb: 2, pt: 1, pb: 1, width: '100%', fontSize: { xs: '16px', lg: '18px' } }}
                  fullWidth
                >
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </CustomButton>
                <Grid container justifyContent="center">
                  <Grid item>
                    <Link href="#" variant="body2" onClick={handleToggle} sx={{ color: '#6a1b9a' }}>
                      {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </form>
              <Box mt={5}>
                <Typography variant="body2" color="textSecondary" align="center">
                  By continuing, you acknowledge that you have read and understood, and agree to our{' '}
                  <Link href="#" variant="body2" sx={{ color: '#6a1b9a' }}>
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="#" variant="body2" sx={{ color: '#6a1b9a' }}>
                    Privacy Policy
                  </Link>.
                </Typography>
              </Box>
            </FormBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
  
};

export default UseLogin;


// import React, { useState } from 'react';
// import { Container, Grid, TextField, Button, Typography, Link, Box } from '@mui/material';
// import { styled } from '@mui/system';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import backgroundImage from './image.png';

// const BackgroundImage = styled(Box)(({ theme }) => ({
//   backgroundImage: `url(${backgroundImage})`,
//   backgroundSize: 'cover',
//   backgroundPosition: 'center',
//   height: '100vh',
//   [theme.breakpoints.down('md')]: {
//     height: '50vh',
//   },
// }));

// const FormContainer = styled(Container)({
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
//   height: '100vh', // Adjusted from minHeight to height
//   padding: '1rem',
// });

// const FormBox = styled(Box)({
//   backgroundColor: '#fff',
//   padding: '2rem',
//   borderRadius: '8px',
//   boxShadow: '0 0 10px rgba(0,0,0,0.1)',
//   maxWidth: '500px',
//   width: '100%',
//   textAlign: 'center',
//   overflow: 'hidden', // Prevents scrolling inside the form box
// });

// const CustomButton = styled(Button)({
//   width: '100%',
//   marginTop: '1.5rem',
//   padding: '0.5rem', // Adjusted padding for smaller button
//   borderRadius: '5px',
//   backgroundColor: '#6a1b9a', // Purple color for the button
//   '&:hover': {
//     backgroundColor: '#4a148c',
//   },
// });

// const CustomLink = styled(Link)({
//   display: 'block',
//   textAlign: 'center', // Center align the link
//   marginTop: '1rem',
// });

// const UseLogin = () => {
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const navigate = useNavigate();

//   const handleToggle = () => {
//     setIsSignUp(!isSignUp);
//   };

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:5000/signup', {
//         email,
//         password,
//         first_name: firstName,
//         last_name: lastName,
//       });
//       console.log(response.data);
//     } catch (error) {
//       console.error(error.response.data);
//     }
//   };

//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:5000/signin', {
//         email,
//         password,
//       });
//       console.log(response.data);
//       navigate('/Quiz');
//     } catch (error) {
//       console.error(error.response.data);
//     }
//   };

//   return (
//     <Grid container>
//       <Grid item xs={12} md={6}>
//         <BackgroundImage />
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <FormContainer>
//           <FormBox>
//             <Typography variant="h4" component="h1" gutterBottom>
//               Study Buddy
//             </Typography>
//             <Typography variant="h6" component="h2" gutterBottom>
//               {isSignUp ? 'Create an Account' : 'Start Learning Today!'}
//             </Typography>
//             <form noValidate onSubmit={isSignUp ? handleSignUp : handleSignIn}>
//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 id="email"
//                 label="Email Address"
//                 name="email"
//                 autoComplete="email"
//                 autoFocus
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 name="password"
//                 label="Password"
//                 type="password"
//                 id="password"
//                 autoComplete="current-password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//               {isSignUp && (
//                 <>
//                   <TextField
//                     margin="normal"
//                     required
//                     fullWidth
//                     name="firstName"
//                     label="First Name"
//                     id="firstName"
//                     value={firstName}
//                     onChange={(e) => setFirstName(e.target.value)}
//                   />
//                   <TextField
//                     margin="normal"
//                     required
//                     fullWidth
//                     name="lastName"
//                     label="Last Name"
//                     id="lastName"
//                     value={lastName}
//                     onChange={(e) => setLastName(e.target.value)}
//                   />
//                 </>
//               )}
//               <CustomButton
//                 type="submit"
//                 variant="contained"
//                 color="primary"
//                 sx={{ mt: 3, mb: 2 }}
//               >
//                 {isSignUp ? 'Sign Up' : 'Continue'}
//               </CustomButton>
//               <CustomLink href="#" variant="body2" onClick={handleToggle}>
//                 {isSignUp ? 'Already have an account? Sign In' : "Haven't registered yet? Click here to register"}
//               </CustomLink>
//             </form>
//             <Box mt={5}>
//               <Typography variant="body2" color="textSecondary" align="center">
//                 By continuing, you acknowledge that you have read and understood, and agree to our{' '}
//                 <Link href="#" variant="body2">
//                   Terms & Conditions
//                 </Link>{' '}
//                 and{' '}
//                 <Link href="#" variant="body2">
//                   Privacy Policy
//                 </Link>
//                 .
//               </Typography>
//             </Box>
//           </FormBox>
//         </FormContainer>
//       </Grid>
//     </Grid>
//   );
// };

// export default UseLogin;

