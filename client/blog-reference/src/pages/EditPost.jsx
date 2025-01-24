import { useEffect, useState } from "react";
import {Navigate, useParams} from "react-router-dom";
import Editor from "../Editor";

function EditPost() {
  const {id} = useParams();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState('');
  const [redirect, setRedirect] = useState(false);
  const apiPortLink = import.meta.env.VITE_APP_PORT_LINK;
  const apiStatic = import.meta.env.REACT_APP_STATIC;
  
  // Fetch post data from API
  useEffect(() => {
    fetch(`${apiStatic}/post/` + id)
      .then(response => {
        response.json().then(postInfo => {
          setTitle(postInfo.title);
          setContent(postInfo.content);
          setSummary(postInfo.summary);
          setFiles(postInfo.files);
        });
      });
  }, []);

  // Handle form submission
  async function updatePost(ev) {
    ev.preventDefault();  
    const data = new FormData();  // Create a new FormData object
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('id', id);

    if (files?.[0]) {
      data.set('file', files[0]);
    }

    // Send the form data to the server
    const response = await fetch(`${apiStatic}/post`, {
      method: 'PUT',
      body: data,
      credentials: 'include',
    });
    if (response.ok) {
      setRedirect(true);  // set the value of redirect to true
    }
  }

  // If redirect is true, return to homepage
  if (redirect) {
    return <Navigate to={'/post/'+id}/>  // Redirect to the post page
  }

  return(
    <form onSubmit={updatePost}>
      <input type="title"
             placeholder={'Title'}
             value={title}
             onChange={ev => setTitle(ev.target.value)} />
      <input type="summary"
             placeholder={'Summary'}
             value={summary}
             onChange={ev => setSummary(ev.target.value)} />
      <input type="file"
             onChange={ev => setFiles(ev.target.files)}/>
      {/* Adds the text editor */}  
      <Editor onChange={setContent} value={content} />
      <button style={{marginTop:'5px'}}>Update post</button>
    </form>
   ); 
}

export default EditPost