// controllers/emailController.js
import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import EmailTemplate from '../models/EmailTemplate.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getEmailLayout = async (req, res) => {
  try {
    const layoutPath = path.join(__dirname, '../templates/layout.html');
    const layout = await fs.readFile(layoutPath, 'utf-8');
    res.send(layout);
  } catch (error) {
    res.status(500).json({ error: 'Error reading layout file' });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading image' });
  }
};

export const uploadEmailConfig = async (req, res) => {
  try {
    const { sections, styles } = req.body;
    
    const emailTemplate = new EmailTemplate({
      sections,
      styles,
      createdAt: new Date()
    });

    await emailTemplate.save();
    res.json({ message: 'Template saved successfully', template: emailTemplate });
  } catch (error) {
    res.status(500).json({ error: 'Error saving template configuration' });
  }
};

export const renderAndDownloadTemplate = async (req, res) => {
  try {
    const { templateId } = req.body;
    
    // Get template from database
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Read layout file
    const layoutPath = path.join(__dirname, '../templates/layout.html');
    const layoutSource = await fs.readFile(layoutPath, 'utf-8');
    
    // Compile template
    const compiledTemplate = Handlebars.compile(layoutSource);
    
    // Prepare data for template
    const templateData = {
      sections: template.sections.sort((a, b) => a.order - b.order),
      styles: template.styles
    };
    
    // Render HTML
    const renderedHtml = compiledTemplate(templateData);
    
    // Save rendered HTML
    const outputPath = path.join(__dirname, '../output', `template-${templateId}.html`);
    await fs.writeFile(outputPath, renderedHtml);
    
    // Send file to client
    res.download(outputPath);
  } catch (error) {
    res.status(500).json({ error: 'Error rendering template' });
  }
};