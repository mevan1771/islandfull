const fs = require('fs');
const path = require('path');

const drawerPath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

// Add mounted state
drawerContent = drawerContent.replace(
    /}: BookingDrawerProps\) {\s*const \[isOpen, setIsOpen\] = useState\(false\)/g,
    `}: BookingDrawerProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const [isOpen, setIsOpen] = useState(false)`
);

fs.writeFileSync(drawerPath, drawerContent, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
