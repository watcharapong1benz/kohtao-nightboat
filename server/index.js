const express = require('express');
const cors = require('cors');
const { initializeFirebase } = require('./firebaseConfig');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
const db = initializeFirebase();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.SECRET_KEY || 'supersecretkey';

app.use(cors());
app.use(express.json());
// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userSnapshot = await db.collection('users').where('username', '==', username).limit(1).get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        const userDoc = userSnapshot.docs[0];
        const user = { id: userDoc.id, ...userDoc.data() };

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '12h' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/register', async (req, res) => {
    // Initial seeding or admin creation
    const { username, password, name, role } = req.body;
    try {
        // Check if username exists
        const existingUser = await db.collection('users').where('username', '==', username).limit(1).get();
        if (!existingUser.empty) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRef = db.collection('users').doc();
        await userRef.set({
            username,
            password: hashedPassword,
            name,
            role: role || 'STAFF',
            createdAt: new Date().toISOString()
        });

        const user = { id: userRef.id, username, name, role: role || 'STAFF' };
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- TICKET ROUTES ---

app.get('/api/tickets', authenticateToken, async (req, res) => {
    const { date } = req.query; // date string YYYY-MM-DD
    try {
        let query = db.collection('tickets');

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            query = query.where('travelDate', '>=', start.toISOString())
                .where('travelDate', '<=', end.toISOString());
        }

        // AGENT sees only their own tickets
        if (req.user.role === 'AGENT') {
            query = query.where('sellerId', '==', req.user.id);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tickets', authenticateToken, async (req, res) => {
    const { passengerName, phone, route, seatNumber, seatLayout, price, travelDate } = req.body;

    try {
        // Check if seat is taken
        const existingTicket = await db.collection('tickets')
            .where('travelDate', '==', new Date(travelDate).toISOString())
            .where('route', '==', route)
            .where('seatNumber', '==', seatNumber)
            .where('seatLayout', '==', seatLayout)
            .limit(1)
            .get();

        if (!existingTicket.empty) {
            return res.status(400).json({ message: 'Seat already taken' });
        }

        const ticketRef = db.collection('tickets').doc();
        const ticketData = {
            passengerName,
            phone,
            route,
            seatNumber,
            seatLayout,
            price: parseFloat(price),
            travelDate: new Date(travelDate).toISOString(),
            sellerId: req.user.id,
            sellerName: req.user.name,
            createdAt: new Date().toISOString()
        };

        await ticketRef.set(ticketData);
        res.json({ id: ticketRef.id, ...ticketData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tickets/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const ticketRef = db.collection('tickets').doc(id);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // AGENT check ownership
        if (req.user.role === 'AGENT') {
            const ticket = ticketDoc.data();
            if (ticket.sellerId !== req.user.id) {
                return res.status(403).json({ message: 'Access denied: You can only edit your own tickets' });
            }
        }

        const updateData = { ...data };
        if (data.travelDate) {
            updateData.travelDate = new Date(data.travelDate).toISOString();
        }
        if (data.price) {
            updateData.price = parseFloat(data.price);
        }

        await ticketRef.update(updateData);
        const updatedDoc = await ticketRef.get();
        res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tickets/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const ticketRef = db.collection('tickets').doc(id);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // AGENT check ownership
        if (req.user.role === 'AGENT') {
            const ticket = ticketDoc.data();
            if (ticket.sellerId !== req.user.id) {
                return res.status(403).json({ message: 'Access denied: You can only delete your own tickets' });
            }
        }

        await ticketRef.delete();
        res.json({ message: 'Ticket deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- PARCEL ROUTES ---

app.get('/api/parcels', authenticateToken, async (req, res) => {
    const { date } = req.query;
    try {
        let query = db.collection('parcels');

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            query = query.where('depositDate', '>=', start.toISOString())
                .where('depositDate', '<=', end.toISOString());
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const parcels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(parcels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/parcels', authenticateToken, async (req, res) => {
    const { senderName, senderPhone, receiverName, receiverPhone, weight, price, depositDate, paymentStatus } = req.body;
    try {
        const parcelRef = db.collection('parcels').doc();
        const parcelData = {
            senderName,
            senderPhone,
            receiverName,
            receiverPhone,
            weight: parseFloat(weight),
            price: parseFloat(price),
            depositDate: new Date(depositDate).toISOString(),
            paymentStatus,
            status: 'WAITING',
            sellerId: req.user.id,
            sellerName: req.user.name,
            createdAt: new Date().toISOString()
        };

        await parcelRef.set(parcelData);
        res.json({ id: parcelRef.id, ...parcelData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/parcels/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const parcelRef = db.collection('parcels').doc(id);
        const parcelDoc = await parcelRef.get();

        if (!parcelDoc.exists) {
            return res.status(404).json({ message: 'Parcel not found' });
        }

        const updateData = { ...data };
        if (data.depositDate) {
            updateData.depositDate = new Date(data.depositDate).toISOString();
        }
        if (data.weight) {
            updateData.weight = parseFloat(data.weight);
        }
        if (data.price) {
            updateData.price = parseFloat(data.price);
        }

        await parcelRef.update(updateData);
        const updatedDoc = await parcelRef.get();
        res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/parcels/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const parcelRef = db.collection('parcels').doc(id);
        const parcelDoc = await parcelRef.get();

        if (!parcelDoc.exists) {
            return res.status(404).json({ error: 'Parcel not found' });
        }

        await parcelRef.delete();
        res.json({ message: 'Parcel deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- USER MANAGEMENT ROUTES (ADMIN ONLY) ---

app.get('/api/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                username: data.username,
                name: data.name,
                role: data.role,
                createdAt: data.createdAt
            };
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const { username, password, name, role } = req.body;
    try {
        const existingUser = await db.collection('users').where('username', '==', username).limit(1).get();
        if (!existingUser.empty) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRef = db.collection('users').doc();
        const userData = {
            username,
            password: hashedPassword,
            name,
            role: role || 'STAFF',
            createdAt: new Date().toISOString()
        };

        await userRef.set(userData);

        const { password: _, ...userWithoutPassword } = userData;
        res.json({ id: userRef.id, ...userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- MAINTENANCE ROUTES ---

app.get('/api/maintenances', authenticateToken, async (req, res) => {
    try {
        const snapshot = await db.collection('maintenances').orderBy('date', 'desc').get();
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/maintenances', authenticateToken, async (req, res) => {
    const { date, details, imageUrl, status, repairDate, technician } = req.body;
    try {
        const maintenanceRef = db.collection('maintenances').doc();
        const maintenanceData = {
            date: new Date(date).toISOString(),
            details,
            imageUrl: imageUrl || null,
            status: status || 'WAITING',
            repairDate: repairDate ? new Date(repairDate).toISOString() : null,
            technician: technician || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await maintenanceRef.set(maintenanceData);
        res.json({ id: maintenanceRef.id, ...maintenanceData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/maintenances/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { date, details, imageUrl, status, repairDate, technician } = req.body;

    try {
        const maintenanceRef = db.collection('maintenances').doc(id);
        const maintenanceDoc = await maintenanceRef.get();

        if (!maintenanceDoc.exists) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        const updateData = { updatedAt: new Date().toISOString() };
        if (date) updateData.date = new Date(date).toISOString();
        if (details !== undefined) updateData.details = details;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (status !== undefined) updateData.status = status;
        if (repairDate !== undefined) updateData.repairDate = repairDate ? new Date(repairDate).toISOString() : null;
        if (technician !== undefined) updateData.technician = technician;

        await maintenanceRef.update(updateData);
        const updatedDoc = await maintenanceRef.get();
        res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/maintenances/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const maintenanceRef = db.collection('maintenances').doc(id);
        const maintenanceDoc = await maintenanceRef.get();

        if (!maintenanceDoc.exists) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        await maintenanceRef.delete();
        res.json({ message: 'Maintenance record deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- DASHBOARD ROUTES ---

app.get('/api/dashboard', authenticateToken, async (req, res) => {
    // Totals for TODAY
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayISO = today.toISOString();
    const tomorrowISO = tomorrow.toISOString();

    try {
        // Fetch all tickets and filter in memory to avoid composite index requirements
        const allTicketsSnapshot = await db.collection('tickets').orderBy('createdAt', 'desc').get();
        const todayTickets = allTicketsSnapshot.docs.filter(doc => {
            const createdAt = doc.data().createdAt;
            return createdAt >= todayISO && createdAt < tomorrowISO;
        });

        const ticketsSoldToday = todayTickets.length;

        // Calculate ticket revenue
        let ticketRevenue = 0;
        todayTickets.forEach(doc => {
            ticketRevenue += doc.data().price || 0;
        });

        // Fetch all parcels and filter in memory
        const allParcelsSnapshot = await db.collection('parcels').orderBy('createdAt', 'desc').get();
        const todayParcels = allParcelsSnapshot.docs.filter(doc => {
            const depositDate = doc.data().depositDate;
            return depositDate >= todayISO && depositDate < tomorrowISO;
        });

        const parcelsdepositedToday = todayParcels.length;

        // Calculate parcel revenue
        let parcelRevenue = 0;
        todayParcels.forEach(doc => {
            parcelRevenue += doc.data().price || 0;
        });

        const totalRevenue = ticketRevenue + parcelRevenue;

        // Count parcels waiting
        const parcelsWaitingSnapshot = await db.collection('parcels')
            .where('status', '==', 'WAITING')
            .get();
        const parcelsWaiting = parcelsWaitingSnapshot.size;

        // Get recent tickets (limit 5) - already sorted by createdAt desc
        const recentTickets = todayTickets.slice(0, 5).map(doc => ({
            id: doc.id,
            ...doc.data(),
            seller: { name: doc.data().sellerName }
        }));

        // Get recent parcels (limit 5) - already sorted by createdAt desc
        const recentParcels = todayParcels.slice(0, 5).map(doc => ({
            id: doc.id,
            ...doc.data(),
            seller: { name: doc.data().sellerName }
        }));

        res.json({
            ticketsSoldToday,
            parcelsdepositedToday,
            totalRevenue,
            parcelsWaiting,
            recentTickets,
            recentParcels
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: error.message });
    }
});


// Catch-all route to serve the React app
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/dist/index.html'));
// });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
