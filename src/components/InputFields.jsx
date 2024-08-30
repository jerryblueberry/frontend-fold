import { useState, useRef, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './InputFields.css'; 

const InputFields = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [errors, setErrors] = useState(new Array(6).fill(true)); 
  // eslint-disable-next-line no-unused-vars
  const [allEmpty, setAllEmpty] = useState(true);
  const inputs = useRef([]);

  useEffect(() => {
    
    const initialErrors = otp.map(val => val === '');
    setErrors(initialErrors);
    setAllEmpty(otp.every(val => val === ''));
  }, [otp]);

  const handleChange = (element, index) => {
    const value = element.value.replace(/\D/g, ''); 

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

  
    const newErrors = [...errors];
    newErrors[index] = !value; 
    setErrors(newErrors);

  
    setAllEmpty(newOtp.every(val => val === ''));

  
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (index > 0 && !otp[index]) {
        inputs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    if (paste.length === 6) {
      setOtp(paste.split(''));
      setErrors(new Array(6).fill(false));
      setAllEmpty(false); 
      inputs.current[5].focus(); 
    }
  };

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length !== 6 || errors.some(err => err)) {
      toast.error('Please correct the errors in the input fields');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8000/otp/verify', 
        { code },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const result = response.data;
  
      if (result.success) {
        toast.success('Verification successful!');
      } else {
        toast.error('Verification Error');
      }
    } catch (error) {
      toast.error('Verification Error');
      console.log("Error Occurred", error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <p>Verification Code</p>
        <div
          className="input-group"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputs.current[index] = el)}
              className={errors[index] ? 'error' : 'valid'}
            />
          ))}
        </div>
        <div className="button-container">
          <button onClick={handleSubmit}>
            Submit
          </button>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default InputFields;
