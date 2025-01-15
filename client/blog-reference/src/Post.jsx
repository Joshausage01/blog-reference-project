import { format } from 'date-fns'; // Time format from date-fns package
import { Link } from 'react-router-dom';

function Post({_id, title, summary, content, cover, createdAt, author}){
  return(
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={'http://localhost:4000/'+cover} alt="place-holder" />
        </Link>
      </div>
      <div className="texts">
        <Link to={`/post/${_id}`}>
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <a className="author">{author.username}</a>
          <time>{format(new Date(createdAt), 'MMM d, yyyy HH:mm')}</time> {/* Creates the time format */} 
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
}

export default Post