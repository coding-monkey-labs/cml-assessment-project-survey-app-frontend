import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import LinkList from './components/LinkList'
import LinkForm from './components/LinkForm'
import Categories from './components/Categories'
import Favorites from './components/Favorites'
import Archive from './components/Archive'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="links" element={<LinkList />} />
        <Route path="add" element={<LinkForm />} />
        <Route path="edit/:id" element={<LinkForm />} />
        <Route path="categories" element={<Categories />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="archive" element={<Archive />} />
      </Route>
    </Routes>
  )
}

export default App
