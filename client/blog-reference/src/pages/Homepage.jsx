import { useEffect, useState } from "react";
import Post from "../Post";
import confusedFace from '../assets/face-confused.svg';

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
      {/* If there are posts, render them */}
      {posts.length > 0 ? (
        posts.map(post => (
          <Post key={post._id} {...post} /> // Add a unique key for each post
        ))
      ) : (
        // If no posts are available, display a message
        <div className="no-post" style={{ textAlign: "center", marginTop: "50px" }}>
          <div className="no-post-head">
            <img src={confusedFace} className="face-confused" alt="sad-face" />
            <h1 className="no-post-h">No posts available!</h1>
          </div>
          <p className="no-post-msg">Be the first to share your thoughts. Register now and create your own blog post today!</p>
        </div>
      )}
    </>
  );
}

export default HomePage