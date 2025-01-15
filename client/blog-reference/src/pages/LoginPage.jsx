import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

function LoginPage(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const {setUserInfo} = useContext(UserContext);

  async function login(ev) {
    ev.preventDefault();
    const response = await fetch('http://localhost:4000/login', {
      method: 'POST',
      body: JSON.stringify({username, password}),
      headers: {'Content-Type': 'application/json'},
      credentials: 'include', // Considers cookies as credentials
    });
    // Automate the navigation bar
    if (response.ok) {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
        setRedirect(true);
      });
    } else {
      const errorData = await response.json(); // Parse error response
      alert(`Login failed. ${errorData.error}`) // Show error message
    }
  }

  if (redirect) {
    return <Navigate to={'/'} /> // Navigate to homepage
  }
  return(
    <div>
      <form className="login" onSubmit={login}>
        <h1>Login</h1>
        <input type="text"
               placeholder="Username"
               value={username}
               onChange={ev => setUsername(ev.target.value)} />
        <input type="password"
               placeholder="Password"
               value={password}
               onChange={ev => setPassword(ev.target.value)}/>
        <button>Login</button>
    </form>
    </div>
  );
}

export default LoginPage