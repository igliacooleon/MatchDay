const StadiumBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 stadium-bg">
      {/* Grass Pattern Overlay */}
      <div className="absolute inset-0 grass-pattern opacity-30" />
      
      {/* Spotlight Beams */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Left Spotlight */}
        <div 
          className="absolute top-0 left-1/4 w-96 h-full opacity-10 animate-spotlight-sweep"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 50%)',
            filter: 'blur(60px)',
            transformOrigin: 'top center',
            animationDelay: '0s',
          }}
        />
        
        {/* Center Spotlight */}
        <div 
          className="absolute top-0 left-1/2 w-96 h-full opacity-15 animate-spotlight-sweep"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,217,255,0.2) 0%, transparent 60%)',
            filter: 'blur(80px)',
            transformOrigin: 'top center',
            animationDelay: '5s',
          }}
        />
        
        {/* Right Spotlight */}
        <div 
          className="absolute top-0 right-1/4 w-96 h-full opacity-10 animate-spotlight-sweep"
          style={{
            background: 'linear-gradient(to bottom, rgba(57,255,20,0.2) 0%, transparent 50%)',
            filter: 'blur(70px)',
            transformOrigin: 'top center',
            animationDelay: '10s',
          }}
        />
      </div>

      {/* Subtle Radial Gradient for Depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(10, 31, 68, 0.8) 100%)',
        }}
      />
    </div>
  );
};

export default StadiumBackground;
