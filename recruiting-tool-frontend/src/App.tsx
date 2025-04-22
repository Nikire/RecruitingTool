import {Container} from '@mui/material';
import Dashboard from './pages/dashboard/Dashboard';
import {Route, Routes} from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/home/Home';
import HiringProcessPage from './pages/hiring-process/HiringProcessPage';

/* 
Example of good use of Routes
<Routes>
  <Route index element={<Home />} />
  <Route path="about" element={<About />} />

  <Route element={<AuthLayout />}>
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
  </Route>

  <Route path="concerts">
    <Route index element={<ConcertsHome />} />
    <Route path=":city" element={<City />} />
    <Route path="trending" element={<Trending />} />
  </Route>
</Routes> 

*/

function App() {
	return (
		<Container maxWidth="lg">
			<Routes>
				<Route index element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />

				{/* <Route element={<ProtectedRoute />}> */}
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/hiring-process/:uid" element={<HiringProcessPage />} />
				{/* </Route> */}
			</Routes>
		</Container>
	);
}

export default App;
