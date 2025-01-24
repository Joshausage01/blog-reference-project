import { format } from "date-fns";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UserContext } from "../UserContext";

function PostPage() {
  const [postInfo, setPostInfo] = useState(null);  // State for storing post information
  const {userInfo} = useContext(UserContext);   // Access the user information from the UserContext
  const {id} = useParams();   // Get the post ID from the URL parameters
  const apiPortLink = import.meta.env.VITE_APP_PORT_LINK;
  const apiStatic = 'https://zealous-tree-01c94ac1e.4.azurestaticapps.net';

  // Get the post ID from the URL parameters
  useEffect(() => {
    fetch(`${apiStatic}/post/${id}`)
    .then(response => {
      response.json().then(postInfo => {
        setPostInfo(postInfo);  // Store the retrieved post data in state
      });
    });
  }, []);

  if (!postInfo) return '';   // Return nothing if postInfo is not yet loaded
  // Check if createdAt exists in the response.
  const {createdAt} = postInfo;

  // Delete post function
  async function handleDeletePost(postId) {
    const confirmDelete = window.confirm("Are you sure to you want to delete this post?");
    if (confirmDelete) {
      try {
        const response = await fetch(`${apiStatic}/post/${postId}`, {
          method: 'DELETE',  // HTTP DELETE request
          credentials: 'include', // Include cookies for authentication
        });

        if (response.ok) {
          alert("Post deleted successfully");
          window.location.href = "/";  // Redirect to the home page
        } else {
          alert("Failed to delete the post");
        }
      } catch (error) {
        console.error("Error deleting the post:", error);
        alert("An error occurred. Please try again later.");
      }
    }
  }

  return(
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{format(new Date(createdAt), 'MMM d, yyyy h:mm a')} PHT</time>
      <div className="author" >by: @{postInfo.author.username}</div>
      {/* Creates the edit button if the user is the author of the post. */}
      {userInfo.id === postInfo.author._id && (
        <div className="edit-row">
          <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
            {/* Imports and Icon from heroicons */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            Edit post
          </Link>

          {/* Deletes the post if the user is the author of the post. */}
          <button
            className="delete-btn"
            onClick={() => handleDeletePost(postInfo._id)}
          > Delete post</button>
        </div>
      )}
      <div className="image">
        <img src={`${apiStatic}/${postInfo.cover}`} alt="" /> 
      </div>
     <div className="content" 
      dangerouslySetInnerHTML={{__html: postInfo.content}}/> {/* Prints HTML from a string */}
    </div>
  );
}

export default PostPage