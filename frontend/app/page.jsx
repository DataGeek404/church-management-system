'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Fade,
  TextField,
} from '@mui/material';
import {
  Church as ChurchIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Groups as GroupsIcon,
  MenuBook as MenuBookIcon,
  VolunteerActivism as VolunteerActivismIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  PlayCircleOutline as PlayCircleIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Facebook as FacebookIcon,
  YouTube as YouTubeIcon,
  ArrowForward as ArrowForwardIcon,
  Schedule as ScheduleIcon,
  CalendarMonth as CalendarMonthIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  MusicNote as MusicNoteIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';

const NAV_ITEMS = [
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Events', id: 'events' },
  { label: 'Leadership', id: 'leadership' },
  { label: 'Gallery', id: 'gallery' },
  { label: 'Sermons', id: 'sermons' },
  { label: 'Give', id: 'donate' },
  { label: 'Contact', id: 'contact' },
];

const SERVICE_TIMES = [
  { day: 'Sunday', time: '9:00 AM', service: 'Morning Worship', icon: <ChurchIcon /> },
  { day: 'Sunday', time: '11:00 AM', service: 'Main Service', icon: <GroupsIcon /> },
  { day: 'Wednesday', time: '6:30 PM', service: 'Midweek Bible Study', icon: <MenuBookIcon /> },
  { day: 'Friday', time: '7:00 PM', service: 'Prayer Meeting', icon: <FavoriteIcon /> },
];

const UPCOMING_EVENTS = [
  { date: 'Apr 20', title: 'Easter Sunday Celebration', description: 'Join us for a special Easter service with worship, choir, and fellowship lunch.' },
  { date: 'May 3', title: 'Community Outreach Day', description: 'Serve our local community through food drives, clean-up efforts, and neighbourhood visits.' },
  { date: 'May 17', title: 'Youth Conference 2026', description: 'A weekend of worship, workshops, and fun activities for young people aged 13–25.' },
  { date: 'Jun 7', title: 'Annual Church Picnic', description: 'A family-friendly day out at the park with games, food, and great fellowship.' },
];

const LEADERSHIP = [
  { name: 'Rev. James McAllister', role: 'Senior Pastor', initials: 'JM', color: '#27ae60' },
  { name: 'Sarah Campbell', role: 'Associate Pastor', initials: 'SC', color: '#2980b9' },
  { name: 'David Henderson', role: 'Worship Director', initials: 'DH', color: '#8e44ad' },
  { name: 'Margaret Fraser', role: 'Youth Ministry Lead', initials: 'MF', color: '#d35400' },
  { name: 'Robert Wallace', role: 'Elder & Treasurer', initials: 'RW', color: '#16a085' },
  { name: 'Fiona Stewart', role: 'Outreach Coordinator', initials: 'FS', color: '#c0392b' },
];

const GALLERY_ITEMS = [
  { title: 'Sunday Worship', gradient: 'linear-gradient(135deg, #27ae60, #2ecc71)' },
  { title: 'Youth Group', gradient: 'linear-gradient(135deg, #2980b9, #3498db)' },
  { title: 'Community Service', gradient: 'linear-gradient(135deg, #8e44ad, #9b59b6)' },
  { title: 'Easter Celebration', gradient: 'linear-gradient(135deg, #d35400, #e67e22)' },
  { title: 'Church Choir', gradient: 'linear-gradient(135deg, #c0392b, #e74c3c)' },
  { title: 'Fellowship Dinner', gradient: 'linear-gradient(135deg, #16a085, #1abc9c)' },
];

const SERMONS = [
  { title: 'Walking in Faith', speaker: 'Rev. James McAllister', date: 'Apr 6, 2026', duration: '42 min' },
  { title: 'The Power of Prayer', speaker: 'Sarah Campbell', date: 'Mar 30, 2026', duration: '38 min' },
  { title: 'Love Your Neighbour', speaker: 'Rev. James McAllister', date: 'Mar 23, 2026', duration: '45 min' },
];

function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ---------- Section wrapper ----------
function Section({ id, children, sx = {} }) {
  return (
    <Box
      id={id}
      component="section"
      sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: '80px', ...sx }}
    >
      {children}
    </Box>
  );
}

function SectionTitle({ children, subtitle, light = false }) {
  return (
    <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '1.8rem', md: '2.5rem' },
          color: light ? 'white' : '#1a1a2e',
          mb: 1.5,
        }}
      >
        {children}
      </Typography>
      {subtitle && (
        <Typography
          variant="h6"
          sx={{
            color: light ? 'rgba(255,255,255,0.85)' : '#666',
            fontWeight: 400,
            maxWidth: 600,
            mx: 'auto',
            fontSize: { xs: '0.95rem', md: '1.15rem' },
          }}
        >
          {subtitle}
        </Typography>
      )}
      <Box
        sx={{
          width: 60,
          height: 4,
          borderRadius: 2,
          bgcolor: light ? 'rgba(255,255,255,0.6)' : '#27ae60',
          mx: 'auto',
          mt: 2,
        }}
      />
    </Box>
  );
}

// ============================================================
// Main page
// ============================================================
export default function WelcomePage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id) => {
    scrollToSection(id);
    setDrawerOpen(false);
  };

  // ---- RENDER ----
  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ========== NAVBAR ========== */}
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          bgcolor: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
          color: scrolled ? '#333' : 'white',
          transition: 'all 0.3s ease',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={() => scrollToSection('hero')}
          >
            <ChurchIcon sx={{ fontSize: 32, color: scrolled ? '#27ae60' : 'white' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
              Scotland Church
            </Typography>
          </Box>

          {isMobile ? (
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'inherit' }}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  sx={{
                    color: 'inherit',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    '&:hover': { bgcolor: scrolled ? 'rgba(39,174,96,0.08)' : 'rgba(255,255,255,0.15)' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="contained"
                onClick={() => router.push('/login')}
                sx={{
                  ml: 1,
                  bgcolor: '#27ae60',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 3,
                  px: 3,
                  '&:hover': { bgcolor: '#1e8449' },
                }}
              >
                Login
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2 }}>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {NAV_ITEMS.map((item) => (
              <ListItem
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(39,174,96,0.08)' } }}
              >
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItem>
            ))}
            <ListItem sx={{ mt: 1, px: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => { setDrawerOpen(false); router.push('/login'); }}
                sx={{ bgcolor: '#27ae60', textTransform: 'none', fontWeight: 600, borderRadius: 3, '&:hover': { bgcolor: '#1e8449' } }}
              >
                Login
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* ========== HERO ========== */}
      <Box
        id="hero"
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a5c32 0%, #27ae60 40%, #2ecc71 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
          px: 2,
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={800}>
            <Box>
              <ChurchIcon sx={{ fontSize: { xs: 60, md: 80 }, color: 'rgba(255,255,255,0.9)', mb: 2 }} />
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                  color: 'white',
                  letterSpacing: '-1px',
                  lineHeight: 1.1,
                  mb: 2,
                }}
              >
                Scotland Church
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.4rem' },
                  maxWidth: 640,
                  mx: 'auto',
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                A place of faith, hope, and love. Join us as we worship together,
                grow in community, and serve those around us.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/login')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: 'white',
                    color: '#27ae60',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  }}
                >
                  Member Login
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => scrollToSection('services')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.6)',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Our Services
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>

        {/* Scroll indicator */}
        <Box
          onClick={() => scrollToSection('about')}
          sx={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
              '50%': { transform: 'translateX(-50%) translateY(-10px)' },
            },
          }}
        >
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', mb: 0.5 }}>Scroll Down</Typography>
          <Box sx={{ width: 24, height: 40, border: '2px solid rgba(255,255,255,0.5)', borderRadius: 12, mx: 'auto', position: 'relative' }}>
            <Box sx={{ width: 4, height: 8, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2, position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)' }} />
          </Box>
        </Box>
      </Box>

      {/* ========== ABOUT US ========== */}
      <Section id="about" sx={{ bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <SectionTitle subtitle="Learn about our mission and what drives us as a community of faith">
            About Us
          </SectionTitle>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: 280, md: 380 },
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
                <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
                <ChurchIcon sx={{ fontSize: 120, color: 'rgba(255,255,255,0.85)' }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 2 }}>
                Our Mission
              </Typography>
              <Typography sx={{ color: '#555', lineHeight: 1.9, mb: 3, fontSize: '1.02rem' }}>
                Scotland Church is a vibrant, welcoming community rooted in the teachings of Jesus Christ.
                For over 50 years, we have been a beacon of hope in our community — bringing people together
                through worship, discipleship, and compassionate service.
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 2 }}>
                Our Vision
              </Typography>
              <Typography sx={{ color: '#555', lineHeight: 1.9, mb: 3, fontSize: '1.02rem' }}>
                We envision a world transformed by the love and grace of God. Our goal is to equip every
                believer to live out their faith authentically — in their families, workplaces, and
                neighbourhoods — making a lasting impact for the Kingdom.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {[
                  { num: '50+', label: 'Years of Ministry' },
                  { num: '500+', label: 'Church Members' },
                  { num: '20+', label: 'Ministries' },
                ].map((stat) => (
                  <Box key={stat.label} sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: '#27ae60' }}>{stat.num}</Typography>
                    <Typography sx={{ color: '#888', fontSize: '0.85rem' }}>{stat.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* ========== SERVICE TIMES ========== */}
      <Section id="services" sx={{ bgcolor: '#f8faf9' }}>
        <Container maxWidth="lg">
          <SectionTitle subtitle="We would love to see you at any of our weekly gatherings">
            Service Times
          </SectionTitle>
          <Grid container spacing={3} justifyContent="center">
            {SERVICE_TIMES.map((svc, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card
                  elevation={0}
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid #e8f5e9',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(39,174,96,0.12)' },
                  }}
                >
                  <Avatar sx={{ bgcolor: '#e8f5e9', color: '#27ae60', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                    {svc.icon}
                  </Avatar>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', mb: 0.5 }}>
                    {svc.service}
                  </Typography>
                  <Typography sx={{ color: '#27ae60', fontWeight: 600, mb: 0.5 }}>
                    {svc.day}
                  </Typography>
                  <Typography sx={{ color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16 }} /> {svc.time}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* ========== UPCOMING EVENTS ========== */}
      <Section id="events" sx={{ bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <SectionTitle subtitle="Stay connected and join us at our upcoming church events">
            Upcoming Events
          </SectionTitle>
          <Grid container spacing={3}>
            {UPCOMING_EVENTS.map((ev, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    border: '1px solid #eee',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' },
                  }}
                >
                  <Box sx={{ bgcolor: '#27ae60', color: 'white', py: 2, px: 3, textAlign: 'center' }}>
                    <CalendarMonthIcon sx={{ fontSize: 28, mb: 0.5 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{ev.date}</Typography>
                  </Box>
                  <CardContent sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e', mb: 1 }}>
                      {ev.title}
                    </Typography>
                    <Typography sx={{ color: '#777', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {ev.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* ========== LEADERSHIP ========== */}
      <Section id="leadership" sx={{ bgcolor: '#f8faf9' }}>
        <Container maxWidth="lg">
          <SectionTitle subtitle="Meet the dedicated leaders who guide our church family">
            Our Leadership
          </SectionTitle>
          <Grid container spacing={3} justifyContent="center">
            {LEADERSHIP.map((leader, i) => (
              <Grid item xs={6} sm={4} md={2} key={i}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: { xs: 80, md: 100 },
                      height: { xs: 80, md: 100 },
                      mx: 'auto',
                      mb: 2,
                      bgcolor: leader.color,
                      fontSize: { xs: '1.3rem', md: '1.6rem' },
                      fontWeight: 700,
                      boxShadow: `0 8px 24px ${leader.color}33`,
                    }}
                  >
                    {leader.initials}
                  </Avatar>
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.85rem', md: '0.95rem' }, color: '#1a1a2e' }}>
                    {leader.name}
                  </Typography>
                  <Typography sx={{ color: '#888', fontSize: { xs: '0.75rem', md: '0.85rem' } }}>
                    {leader.role}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* ========== GALLERY ========== */}
      <Section id="gallery" sx={{ bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <SectionTitle subtitle="Glimpses of our church life and community moments">
            Gallery
          </SectionTitle>
          <Grid container spacing={2}>
            {GALLERY_ITEMS.map((item, i) => (
              <Grid item xs={6} sm={4} key={i}>
                <Box
                  sx={{
                    height: { xs: 160, sm: 200, md: 240 },
                    borderRadius: 3,
                    background: item.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.03)' },
                    '&:hover .overlay': { opacity: 1 },
                  }}
                >
                  <PhotoLibraryIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.4)' }} />
                  <Box
                    className="overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                      {item.title}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Typography sx={{ textAlign: 'center', mt: 3, color: '#999', fontSize: '0.9rem', fontStyle: 'italic' }}>
            Add your church photos to the public/images folder to display them here
          </Typography>
        </Container>
      </Section>

      {/* ========== SERMONS ========== */}
      <Section id="sermons" sx={{ bgcolor: '#f8faf9' }}>
        <Container maxWidth="lg">
          <SectionTitle subtitle="Catch up on recent messages and be encouraged in your faith">
            Recent Sermons
          </SectionTitle>
          <Grid container spacing={3} justifyContent="center">
            {SERMONS.map((sermon, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    border: '1px solid #e8f5e9',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(39,174,96,0.12)' },
                  }}
                >
                  <Box
                    sx={{
                      height: 140,
                      background: 'linear-gradient(135deg, #1a5c32, #27ae60)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlayCircleIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.85)' }} />
                  </Box>
                  <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', mb: 1 }}>
                      {sermon.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 16, color: '#27ae60' }} />
                      <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>{sermon.speaker}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <CalendarMonthIcon sx={{ fontSize: 16, color: '#27ae60' }} />
                      <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>{sermon.date}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: '#27ae60' }} />
                      <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>{sermon.duration}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* ========== DONATE / GIVE ========== */}
      <Section
        id="donate"
        sx={{
          background: 'linear-gradient(135deg, #1a5c32 0%, #27ae60 40%, #2ecc71 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 350, height: 350, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <VolunteerActivismIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.9)', mb: 2 }} />
          <SectionTitle light subtitle="Your generous giving supports our ministries, community outreach, and the ongoing work of the church">
            Support Our Ministry
          </SectionTitle>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', mb: 4, maxWidth: 550, mx: 'auto', lineHeight: 1.8 }}>
            &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or
            under compulsion, for God loves a cheerful giver.&rdquo; — 2 Corinthians 9:7
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: '#27ae60',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 3,
                px: 5,
                py: 1.5,
                fontSize: '1.05rem',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
            >
              Give Online
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'rgba(255,255,255,0.6)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 3,
                px: 5,
                py: 1.5,
                fontSize: '1.05rem',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Section>

      {/* ========== CONTACT / LOCATION ========== */}
      <Section id="contact" sx={{ bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <SectionTitle subtitle="We would love to hear from you — reach out or visit us any time">
            Contact Us
          </SectionTitle>
          <Grid container spacing={6}>
            <Grid item xs={12} md={5}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#e8f5e9', color: '#27ae60' }}>
                    <LocationOnIcon />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.3 }}>Address</Typography>
                    <Typography sx={{ color: '#666', lineHeight: 1.6 }}>
                      123 High Street<br />
                      Edinburgh, Scotland EH1 1AB
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#e8f5e9', color: '#27ae60' }}>
                    <PhoneIcon />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.3 }}>Phone</Typography>
                    <Typography sx={{ color: '#666' }}>+44 131 234 5678</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#e8f5e9', color: '#27ae60' }}>
                    <EmailIcon />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.3 }}>Email</Typography>
                    <Typography sx={{ color: '#666' }}>info@scotlandchurch.org</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#e8f5e9', color: '#27ae60' }}>
                    <AccessTimeIcon />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.3 }}>Office Hours</Typography>
                    <Typography sx={{ color: '#666', lineHeight: 1.6 }}>
                      Monday – Friday: 9:00 AM – 5:00 PM<br />
                      Saturday: 10:00 AM – 1:00 PM
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton sx={{ bgcolor: '#e8f5e9', color: '#27ae60', '&:hover': { bgcolor: '#27ae60', color: 'white' } }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton sx={{ bgcolor: '#e8f5e9', color: '#27ae60', '&:hover': { bgcolor: '#27ae60', color: 'white' } }}>
                  <YouTubeIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  height: { xs: 300, md: 420 },
                  borderRadius: 4,
                  overflow: 'hidden',
                  bgcolor: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <iframe
                  title="Scotland Church Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2234.374858028394!2d-3.1910059!3d55.9533456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4887c7a1c12d4b95%3A0x93ede06500f7f328!2sEdinburgh%2C%20UK!5e0!3m2!1sen!2s!4v1680000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* ========== FOOTER ========== */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#1a1a2e',
          color: 'rgba(255,255,255,0.8)',
          pt: { xs: 6, md: 8 },
          pb: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Brand */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ChurchIcon sx={{ color: '#27ae60', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                  Scotland Church
                </Typography>
              </Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, mb: 2, fontSize: '0.9rem' }}>
                A vibrant community of faith in the heart of Edinburgh,
                Scotland. Join us as we worship, grow, and serve together.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#27ae60' } }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#27ae60' } }}>
                  <YouTubeIcon />
                </IconButton>
              </Box>
            </Grid>

            {/* Quick links */}
            <Grid item xs={6} md={2}>
              <Typography sx={{ fontWeight: 700, color: 'white', mb: 2, fontSize: '0.95rem' }}>Quick Links</Typography>
              {['About', 'Services', 'Events', 'Sermons'].map((link) => (
                <Typography
                  key={link}
                  onClick={() => scrollToSection(link.toLowerCase())}
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    mb: 1,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    '&:hover': { color: '#27ae60' },
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Grid>

            {/* More links */}
            <Grid item xs={6} md={2}>
              <Typography sx={{ fontWeight: 700, color: 'white', mb: 2, fontSize: '0.95rem' }}>Community</Typography>
              {['Leadership', 'Gallery', 'Give', 'Contact'].map((link) => (
                <Typography
                  key={link}
                  onClick={() => scrollToSection(link.toLowerCase() === 'give' ? 'donate' : link.toLowerCase())}
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    mb: 1,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    '&:hover': { color: '#27ae60' },
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Grid>

            {/* Contact info */}
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 700, color: 'white', mb: 2, fontSize: '0.95rem' }}>Contact Info</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <LocationOnIcon sx={{ fontSize: 18, color: '#27ae60' }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                  123 High Street, Edinburgh EH1 1AB
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <PhoneIcon sx={{ fontSize: 18, color: '#27ae60' }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                  +44 131 234 5678
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmailIcon sx={{ fontSize: 18, color: '#27ae60' }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                  info@scotlandchurch.org
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              &copy; {new Date().getFullYear()} Scotland Church. All rights reserved.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => router.push('/login')}
              sx={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.6)',
                textTransform: 'none',
                borderRadius: 2,
                fontSize: '0.85rem',
                '&:hover': { borderColor: '#27ae60', color: '#27ae60' },
              }}
            >
              Member Login
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
