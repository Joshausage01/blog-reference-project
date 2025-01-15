import { useEffect, useState } from "react";
import Post from "../Post";

function HomePage(){
  const [posts, setPosts] = useState([]);

  // This will run when the component is mounted
  useEffect(() => {
    fetch('http://localhost:4000/post').then(response => {
      response.json().then(posts => {
        setPosts(posts);
      });
    });
  }, []);

  return(
    <>
      {posts.length > 0 && posts.map(post => (
        <Post {...post} />
      ))}
    </>
  );
}

export default HomePage