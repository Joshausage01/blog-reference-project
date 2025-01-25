import { format } from 'date-fns'; // Time format from date-fns package
import { Link } from 'react-router-dom'; // Link from react-router-dom package

function Post({_id, title, summary, content, cover, createdAt, author}) {
  const apiPortLink = import.meta.env.VITE_APP_PORT_LINK;
  const apiStatic = 'https://zealous-tree-01c94ac1e.4.azurestaticapps.net';

  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>  {/* Link the cover image to post page */}
          <img src={`${apiPortLink}/` + cover} alt="place-holder" />
        </Link>
      </div>
      <div className="texts">
        <Link to={`/post/${_id}`}> {/* Link the title to post page */}
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <a className="author">{author?.username || 'Unknown Author'}</a> {/* Safely access author.username */}
          <time>{createdAt ? format(new Date(createdAt), 'MMM d, yyyy h:mm a') : 'Unknown Date'}</time> {/* Safely handle createdAt */}
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
}

export default Post;
