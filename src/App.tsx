import MainApp from './pages/MainApp'
import './App.css';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#0A1929',
      main: '#0A1929',
    },
    secondary: {
      light: '#001E3C',
      main: '#001E3C',
    }
  }
});
function App() {
  return (
    <ThemeProvider theme={theme}>
      <MainApp />
    </ThemeProvider>
  );
}

export default App;
