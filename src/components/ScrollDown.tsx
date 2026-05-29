// Botão ScrollDown.t
   import '../index.css';


export default function ScrollDown() {
  const handleScroll = () => {
    window.scrollBy({
      top: window.innerHeight, // 100vh
      behavior: "smooth",
    });
  };

  return (
   
    <button className="scroll-down-btn" onClick={handleScroll}>
      <span></span>
    </button>
    
  );
}