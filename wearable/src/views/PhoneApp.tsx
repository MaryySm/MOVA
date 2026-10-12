export default function PhoneApp() {
  const url = `http://${window.location.hostname}:8445`
  return <main style={{height:"100vh",margin:0}}>
    <iframe title="MOVA Teléfono" src={url} style={{width:"100%",height:"100%",border:0}} />
  </main>
}
