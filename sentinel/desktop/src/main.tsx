import {createRoot} from 'react-dom/client';
import '@fontsource-variable/manrope';
import './styles.css';
import App,{FloatingAlert} from './App';
import {SessionProvider} from './context';
const floating=new URLSearchParams(location.search).get('surface')==='alert';
createRoot(document.getElementById('root')!).render(floating?<FloatingAlert/>:<SessionProvider><App/></SessionProvider>);
