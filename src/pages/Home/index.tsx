import './style.css';
import { Link } from 'react-router-dom';

export const Home = () => {

  return <>
    <h1>AI App Examples</h1>
    <nav className="home-nav">
      <ul>
        <li><Link to="/generate-text">Generate Text</Link></li>
        <li><Link to="/generate-json">Generate Structured Data</Link></li>
        <li><Link to="/chat">Chat</Link></li>
      </ul>
    </nav>
  </>;
};
