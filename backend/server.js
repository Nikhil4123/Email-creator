// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// MongoDB Schema
const emailTemplateSchema = new mongoose.Schema({
  name: String,
  config: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

// 1. Get Email Layout
app.get('/api/getEmailLayout', async (req, res) => {
  try {
    const layoutPath = path.join(__dirname, 'templates', 'layout.html');
    const layoutContent = await fs.readFile(layoutPath, 'utf8');
    res.send(layoutContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read layout template' });
  }
});

// 2. Upload Image
app.post('/api/uploadImage', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate a unique filename
    const filename = `${Date.now()}-${req.file.originalname}`;
    const newPath = path.join(__dirname, 'public', 'images', filename);

    // Move file to public directory
    await fs.rename(req.file.path, newPath);

    // Return the public URL
    res.json({ 
      url: `/images/${filename}`,
      filename: filename
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// 3. Upload Email Configuration
app.post('/api/uploadEmailConfig', async (req, res) => {
  try {
    const { name, config } = req.body;
    
    const template = new EmailTemplate({
      name,
      config,
      updatedAt: new Date()
    });

    await template.save();
    res.json({ message: 'Template saved successfully', id: template._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save template configuration' });
  }
});

// 4. Render and Download Template
app.post('/api/renderAndDownloadTemplate', async (req, res) => {
  try {
    const { templateId } = req.body;
    
    // Get template configuration from database
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Get base layout
    const layoutPath = path.join(__dirname, 'templates', 'layout.html');
    let layoutContent = await fs.readFile(layoutPath, 'utf8');

    // Replace placeholders with actual content
    const renderedHTML = generateHTML(layoutContent, template.config);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="email-template-${templateId}.html"`);
    
    res.send(renderedHTML);
  } catch (error) {
    res.status(500).json({ error: 'Failed to render template' });
  }
});

// Helper function to generate final HTML
function generateHTML(layoutTemplate, config) {
  const { sections, styles } = config;
  
  // Sort sections by order
  const sortedSections = sections.sort((a, b) => a.order - b.order);
  
  // Generate content HTML
  const contentHTML = sortedSections.map(section => {
    switch (section.type) {
      case 'title':
        return `<h1 class="title ${styles.titleSize} ${styles.alignment}">${section.content}</h1>`;
      case 'content':
        return `<div class="content-section ${styles.contentSize} ${styles.alignment}">${section.content}</div>`;
      case 'image':
        return section.content ? 
          `<div class="image-section ${styles.alignment}"><img src="${section.content}" alt="Email content"></div>` : '';
      default:
        return '';
    }
  }).join('\n');

  // Apply styles
  let styledHTML = layoutTemplate
    .replace('{{content}}', contentHTML)
    .replace('{{backgroundColor}}', styles.backgroundColor || '#ffffff')
    .replace('{{backgroundImage}}', styles.backgroundImage ? `url(${styles.backgroundImage})` : 'none')
    .replace('{{alignment}}', styles.alignment || 'text-left');

  return styledHTML;
}

// Start server
const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/email-builder')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });