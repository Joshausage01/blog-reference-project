import {Link} from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

function Header() {
  const {setUserInfo, userInfo} = useContext(UserContext);
  const apiPortLink = import.meta.env.VITE_APP_PORT_LINK ;
  const apiStatic = 'https://zealous-tree-01c94ac1e.4.azurestaticapps.net';

  useEffect(() => {
    fetch(`${apiPortLink}/profile`, {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo)
      });
    });
  }, []);

  function logout() {
    fetch(`${apiPortLink}/logout`, {
      credentials: 'include',
      method: 'POST', 
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

  return(
    <header>
        <Link to="/" className="logo">BAYAN-Blogs</Link>
        <nav>
          {/* This block code is representing an if-else statement*/}
          {username && (
            <>
              {/* If the user is logged in, display the username and logout button */}
              <Link to="/create">Create new post</Link>
              <a className="logout" onClick={logout}>Logout</a>
            </>
          )}
          {!username && (
            <>
            {/* If the user is not logged in, display the login and register buttons */}
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
    </header>
  );
}

export default Header