import { useState } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";

function CreatePost() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState('');
  const [redirect, setRedirect] = useState('');

  async function createNewPost(ev) {
    ev.preventDefault();
    // Setting all the data or inputs
    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('file', files[0]);

    const apiPortLink = import.meta.env.VITE_APP_PORT_LINK;
    const apiStatic = 'https://zealous-tree-01c94ac1e.4.azurestaticapps.net';

    const response = await fetch (`${apiPortLink}/post`, {
      method: 'POST',
      body: data,
      credentials: 'include',
    });
    if (response.ok) {
      setRedirect(true);
    }
  }

  // If redirect is true, return to homepage
  if (redirect) {
    return <Navigate to={'/'}/>
  }

 return(
  <form onSubmit={createNewPost}>
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
    <Editor value={content} onChange={setContent} />
    <button style={{marginTop:'5px'}}>Create Post</button>
  </form>
 ); 
}

export default CreatePost