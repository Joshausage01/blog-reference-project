import { useState } from "react";

function RegisterPage(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const apiPortLink = import.meta.env.VITE_APP_PORT_LINK;
  const apiStatic = 'https://zealous-tree-01c94ac1e.4.azurestaticapps.net';

  async function register(ev){
    ev.preventDefault();
    const response = await fetch(`${apiPortLink}/register`, {
      method: 'POST',
      body: JSON.stringify({username, password}),
      headers: {'Content-type':'application/json'},
    });
    if (response.ok) {
      alert('Registration successful');
    } else {
      const errorData = await response.json(); // Parse error response
      alert(`Registration failed: ${errorData.error}`); // Show error message
    }
  }
  
  return(
    <form className="register" onSubmit={register}> 
      <h1>Register</h1>
      <input type="text"
             placeholder="Username" 
             value={username} 
             onChange={ev => setUsername(ev.target.value)} />
      <input type="password" 
             placeholder="Password"
             value={password}
             onChange={ev => setPassword(ev.target.value)} />
      <button>Register</button>
    </form>
  );
}

export default RegisterPage