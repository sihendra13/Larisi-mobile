export default function NotFound() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'system-ui',color:'#111'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>404</div>
      <div style={{fontSize:'18px',fontWeight:'600',marginBottom:'8px'}}>Halaman tidak ditemukan</div>
      <a href="/" style={{color:'#6d28d9',textDecoration:'none',fontSize:'14px'}}>Kembali ke beranda</a>
    </div>
  );
}
