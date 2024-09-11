// import React from "react";
// import { useNavigate, Link } from 'react-router-dom';
// import TypewriterEffect from './TypewriterEffect'; // Make sure this import path is correct

// const Banner = () => {
//   const navigate = useNavigate();

//   const handleClick = () => {
//     navigate('/login'); // Assuming '/UseLogin' is a valid route
//   };

//   return (
//     <>
//       <style>
//         {`
//           @keyframes blink {
//             50% {
//               border-color: transparent;
//             }
//           }
//           .text-container {
//             color: white;
//             width: 100%;
//             text-align: center;
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             background: rgba(255, 255, 255, 0);
//             padding: 20px;
//           }
//         `}
//       </style>

//       <div className="w-full flex pt-20 justify-center items-center">
//         <div className="text-container">
//           <h1 className="text-8xl font-bold leading-tight">StudyBuddy</h1>
//           <h2 className="font-sans text-xl font-bold">
//             <TypewriterEffect text="Platform for Medical Students" />
//           </h2>
//           <p>Welcome to the world of Medical Education<br/> Test your Potential</p>
//           <Link to="/login">
//             <button onClick={handleClick} className="relative inline-block p-px font-semibold leading-6 text-white no-underline bg-gray-700 hover:bg-gray-900 shadow-2xl cursor-pointer group rounded-xl shadow-zinc-900">
//               <span className="relative z-10 flex items-center px-6 py-3 space-x-2 rounded-xl bg-gray-950/50 ring-1 ring-white/10">
//                 Let's get started
//               </span>
//             </button>
//           </Link>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Banner;

// import React from "react";
// import { useNavigate, Link } from 'react-router-dom';
// import TypewriterEffect from './TypewriterEffect';

// const Banner = () => {
//   const navigate = useNavigate();

//   const handleClick = () => {
//     navigate('/login');
//   };

//   return (
//     <>
//       <style>
//         {`
//           @keyframes blink {
//             50% {
//               border-color: transparent;
//             }
//           }
//           .text-container {
//             color: white;  // default text color for the container
//             width: 100%;
//             text-align: center;
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             padding: 20px;
//           }
//           .title {
//             color: #800080;  // Purple color for 'StudyBuddy'
//           }
//           .typewriter-text {
//             color: black;  // Black color for typewriter effect
//           }
//           .button-get-started {
//             background-color: #800080;  // Purple background
//             color: white;  // White text
//             padding: 10px 20px;
//             border: none;
//             border-radius: 5px;
//             cursor: pointer;
//             transition: background-color 0.3s, color 0.3s;
//           }
//           .button-get-started:hover {
//             background-color: #D8BFD8;  // Light purple on hover
//             color: #800080;  // Purple text on hover
//           }
//         `}
//       </style>

//       <div className="w-full flex pt-20 justify-center items-center">
//         <div className="text-container">
//           <h1 className="title text-8xl font-bold leading-tight">StudyBuddy</h1>
//           <div className="typewriter-text">
//             <TypewriterEffect text="Welcome to the world of Medical Education. Test your Potential" />
//           </div>
//           <Link to="/login">
//             <button onClick={handleClick} className="button-get-started">
//               Let's get started
//             </button>
//           </Link>
//         </div>
//       </div>
//     </>
//   );
// };

// // export default Banner;
// import React from "react";
// import { useNavigate, Link } from 'react-router-dom';
// import { useEffect, useState } from 'react';


// const TypewriterEffect = ({ text }) => {
//   const [displayedText, setDisplayedText] = useState('');

//   useEffect(() => {
//     let index = 0;
//     const timer = setInterval(() => {
//       setDisplayedText((prev) => prev + text.charAt(index));
//       index++;
//       if (index === text.length) clearInterval(timer);
//     }, 50); // Adjust the typing speed by changing the delay

//     return () => clearInterval(timer);
//   }, [text]);

//   return (
//     <span style={{ borderRight: '2px solid white', animation: 'blink 1s step-end infinite' }}>
//       {displayedText}
//     </span>
//   );
// };





// const Banner = () => {


//   const navigate = useNavigate();

//   const handleClick = () => {
//     navigate('/login');
//   };




//   return (
   
//     <>
//     <style>
//       {`
//         @keyframes blink {
//           50% {
//             border-color: transparent;
//           }
//         }
//       `}
//     </style>


//     <div className="w-full flex  pt-20 justify-between items-center">



//       <div className="flex justify-start items-start flex-col gap-3 pb-12 pl-16 t ">
         

//         <div>
//           <button  className="   text-8xl font-bold text-white-900 leading-tight">
//               StudyBuddy
//           </button>
//         </div>     
        
//         <div>
//           <h1 className="text-yellow-500 font-sans  text-xl font-bold">
//             <TypewriterEffect text="Welcome to the world of Medicine" />
//           </h1>
//         </div>

//         <div>
//           <p className=" font-sans text-white  text-start">
//             You are on the best platform<br/> to learn medical education. 
//           </p>
//         </div>



//         {/* Button */}
        
//         <div className="mt-4">
//         <Link to={"/login"}>
//             <button
//                 onClick={handleClick}
//                 className="relative inline-block p-px font-semibold leading-6 text-white no-underline bg-gray-700  hover:bg-gray-900 shadow-2xl cursor-pointer group rounded-xl shadow-zinc-900"><span
//                     className="absolute inset-0 overflow-hidden rounded-xl"><span
//                         className="absolute inset-0 rounded-xl  opacity-0 transition-opacity duration-500 group-hover:opacity-100">

//                     </span>
//                 </span>
//                 <div
//                     className="relative z-10 flex items-center px-6 py-3 space-x-2 rounded-xl bg-gray-950/50 ring-1 ring-white/10 ">
//                     <span>Lets get started</span>
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
//                         data-slot="icon" class="w-6 h-6">
//                         <path fill-rule="evenodd"
//                             d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
//                             clip-rule="evenodd"></path>
//                     </svg>
//                 </div>
//                 <span
//                     className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-gray-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
//             </button>
//         </Link>
//     </div>

    
//   </div>



//       <div className="flex items-center  justify-center h-screen mr-44  ">
//       <video
//           className="w-full h-1/2 mb-20   "
          
//           loop
//           autoPlay
//           muted
//         >
//           <source src="/MedTalkVid.mp4" type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
       

//       </div>
//     </div>

//     </>
  
//   );
// };

// export default Banner;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ParticlesComponent from './ParticlesComponent'; // Assuming this is the correct path
import TypewriterEffect from './TypewriterEffect'; // Assuming this is the correct path

const Banner = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulating particle loading completion
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // assuming particles load within 1 second
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleClick = () => {
    navigate('/login');
  };

  return (
    <>
      <ParticlesComponent id="particle-js" />
      <div className="w-full flex pt-20 justify-between items-center" style={{ position: 'relative', zIndex: 10 }}>
        <div className="flex justify-start items-start flex-col gap-3 pb-12 pl-16">
          
          <div>
            <h1 className="text-black font-sans text-xl font-bold">
              <TypewriterEffect text="" />
            </h1>
          </div>
          <div>
            
          </div>
          <div className="mt-4">
            <Link to="/login">
              <button onClick={handleClick}
                      className="relative inline-block p-px font-semibold leading-6 text-white no-underline bg-gray-700 hover:bg-gray-900 shadow-2xl cursor-pointer group rounded-xl shadow-zinc-900 ml-16">
                <span className="absolute inset-0 overflow-hidden rounded-xl">
                  <span className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                </span>
                <div className="relative z-10 flex items-center px-6 py-3 space-x-2 rounded-xl bg-gray-950/50 ring-1 ring-white/10">
                  <span>Let's get started</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                       className="w-6 h-6">
                    <path fillRule="evenodd"
                          d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06z"
                          clipRule="evenodd"></path>
                  </svg>
                </div>
              </button>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center h-screen mr-44">
          <video className="w-full h-1/2 mb-20" loop autoPlay muted>
            <source src="/MedTalkVid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </>
  );
};

export default Banner;
