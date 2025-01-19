import { format } from 'date-fns'; // Time format from date-fns package
import { Link } from 'react-router-dom'; // Link from react-router-dom package

function Post({_id, title, summary, content, cover, createdAt, author}){
  const apiPortLink = import.meta.env.VITE_APP_PORT_LINK;

  return(
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>  {/* Link the cover image to post page */}
          <img src={`${apiPortLink}/`+cover} alt="place-holder" />
        </Link>
      </div>
      <div className="texts">
        <Link to={`/post/${_id}`}> {/* Link the title to post page */}
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <a className="author">{author.username}</a> {/* Display the author's username */}
          <time>{format(new Date(createdAt), 'MMM d, yyyy h:mm a')}</time> {/* Creates the time format */} 
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
}

export default Post