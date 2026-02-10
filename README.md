# Meal Logger App

A React-based meal logging application with AI-powered food recognition and classification using the NEVO food group system.

## 🔍 Project Overview

This is a mobile-first web application that helps users log their meals with the assistance of AI. The app can process text descriptions, voice input, and food images to identify and classify foods according to the official NEVO (Netherlands Food Database) food group system.

### Key Features

- **Multimodal Input**: Support for text, voice, and image input
- **AI Food Recognition**: Powered by AI Foundry for intelligent food identification
- **NEVO Classification**: Automatic classification into 27 official NEVO food groups
- **Saved Foods**: Save frequently eaten foods for quick logging
- **Recent Foods**: Access recently logged meals
- **Contextual Questions**: Optional questions about meal context
- **Participant Management**: Multi-participant support
- **Mobile Responsive**: Optimized for mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AI Foundry API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meal-logger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_AI_FOUNDRY_API_KEY=your-ai-foundry-api-key-here
   VITE_DATASET_API_KEY=your-dataset-api-key-here
   VITE_DB_ID=19158
   VITE_DATABASE_BASE_URL=https://data.id.tue.nl/api/v1/datasets/entity/
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 📊 Data Foundry Study Setup

### Setting Up Your Research Study in TU/e Data Foundry

Follow these steps to deploy your meal logging application and collect research data:

#### Step 1: Create Project in Data Foundry
1. **Login to Data Foundry**
   - Go to [https://data.id.tue.nl](https://data.id.tue.nl)
   - Sign in with your TU/e credentials

2. **Create New Project**
   - Navigate to your dashboard
   - Click "Add Project" or "New Project"
   - Fill in project details (name, description, etc.)

#### Step 2: Set Up Databases

You need to create **two different databases** for your project:

##### Database 1: Existing Dataset (for hosting your app)
1. **Add Existing Dataset**
   - In your project, add a new database
   - Select "Existing Dataset" type
   - This will host your built application files

2. **Configure Web Access**
   - After creating the database, go to "Web Access" settings
   - **Activate web access** - this generates a public URL
   - **Save the URL** - this is where users will access your application

##### Database 2: Entity Dataset (for data collection)
1. **Add Entity Dataset**
   - Add another database to your project
   - Select "Entity Dataset" type
   - This will store your meal logging data

2. **Configure HTTP Data Upload**
   - Go to database configuration
   - Find "HTTP Data Upload" section
   - **Copy the Database ID** (e.g., 19158)
   - **Copy the API Token** (long encoded string)
   - **Note the base URL pattern**: `https://data.id.tue.nl/api/v1/datasets/entity/`

#### Step 3: Configure Environment Variables

Update your `.env` file with the Data Foundry credentials:

```env
# Get these from your Data Foundry project
VITE_AI_FOUNDRY_API_KEY=your-project-api-key-from-data-foundry
VITE_DATASET_API_KEY=your-entity-dataset-token-here
VITE_DB_ID=your-entity-dataset-id-here
VITE_DATABASE_BASE_URL=https://data.id.tue.nl/api/v1/datasets/entity/
```

**Final API endpoint will be constructed as:**  
`https://data.id.tue.nl/api/v1/datasets/entity/{DB_ID}/{DATASET_API_KEY}`

**How to get the API key:**
1. Go to your project in Data Foundry
2. Click "Edit Project" or "Settings"
3. Navigate to "Study Setup" tab
4. Find "API Key" section
5. Click "Create API Key" or copy existing key
6. Add this key as `VITE_AI_FOUNDRY_API_KEY` in your `.env` file

#### Step 4: Build and Deploy Application

1. **Build your project** with the configured environment variables:
   ```bash
   npm run build
   ```

2. **Upload to Data Foundry**
   - Go to your **Existing Dataset** (Database 1)
   - Upload all files from the `dist/` folder
   - Make sure to upload the entire contents of the dist folder

3. **Test the deployment**
   - Use the web access URL from Step 2 to access your application
   - Verify that the application loads correctly
   - Test meal logging functionality to ensure data is being saved

#### Step 5: Study Management

##### Adding Participants to Your Study

1. **Navigate to Participants**
   - Go to your project in Data Foundry
   - Click on the "Resource" tab
   - Select "Add Participant"

2. **Add Individual Participants**
   - Click "Add Participant" 
   - Select "One Person" option
   - Fill in participant details
   - The participant will be added to the participant field

3. **Generate Unique Participant Links**
   - Click on the participant in the participant list
   - You will see a unique shareable link for that participant
   - **Share this link** with the specific participant
   - Each participant gets their own unique URL for the study duration

4. **Managing Your Study**
   - **Participant tracking**: Each participant has their own unique access link
   - **Data isolation**: Data is automatically linked to the correct participant via their unique URL
   - **Study duration**: Participants can use their unique link throughout the entire study period
   - **Monitor data collection** through the Entity Dataset
   - **Access collected data** via Data Foundry's data export features

### Important Notes

- **Build order matters**: Configure your `.env` file BEFORE building the project
- **Final deployment**: Upload the `dist` folder contents as the very last step
- **Data security**: All data is stored securely in TU/e's Data Foundry infrastructure
- **Web access**: The generated URL allows participants to access your study from any device

## 🏗️ Build Process

### Development
```bash
npm run dev
```
Starts the Vite development server with hot module replacement.

### Production Build
```bash
npm run build
```
Creates an optimized production build in the `dist` folder.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing.

### Linting
```bash
npm run lint
```
Runs ESLint to check code quality.

## 🤖 AI Configuration & Prompts

### Prompt Location
All AI prompts are located in: `src/config/prompts.json`

### Prompt Types

#### 1. System Message (`systemMessage`)
- **Purpose**: Main conversational AI prompt for chat interactions
- **Used for**: Text input, voice transcription, image analysis
- **Behavior**: Neutral food logging assistant that asks clarifying questions

#### 2. Summarization Prompt (`summarizationPrompt`)
- **Purpose**: NEVO food group classification and JSON output
- **Used for**: Final food classification before data saving
- **Output**: JSON structure with food names and NEVO groups

#### 3. Saved Food Prompt (`savedFoodPrompt`)
- **Purpose**: Context for when user selects from saved foods
- **Behavior**: Asks about portions and preparation methods

#### 4. Recent Food Prompt (`recentFoodPrompt`)
- **Purpose**: Context for when user selects from recent foods
- **Behavior**: References previous consumption patterns

### How to Modify Prompts

1. **Edit the prompts file**
   ```bash
   src/config/prompts.json
   ```

2. **Update specific prompts**
   ```json
   {
     "systemMessage": "Your new system prompt here...",
     "summarizationPrompt": "Your classification prompt here..."
   }
   ```

3. **Restart the development server**
   Changes to JSON files require a restart to take effect.



## 📁 Project Structure

```
meal-logger/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── BottomNav/    # Bottom navigation
│   │   └── Chat/         # Chat interface & modals
│   ├── config/           # Configuration files
│   │   ├── prompts.json  # AI prompts configuration
│   │   └── extraInfoQuestions.json  # Meal context questions
│   ├── contexts/         # React contexts
│   │   └── ParticipantContext.jsx  # Participant management
│   ├── pages/            # Page components
│   │   ├── ChatPage.jsx
│   │   ├── ExtraInformation.jsx
│   │   └── JournalPage.jsx
│   ├── utils/            # Utility functions
│   │   ├── aiFoundryLibrary.js     # AI Foundry integration
│   │   ├── apiDb.js                # Database utilities
│   │   └── dataFoundationApi.js    # Data API functions
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
└── README.md
```

## 🔧 Environment Variables

### Required Variables

- `VITE_AI_FOUNDRY_API_KEY`: API key for AI Foundry services (food identification, chat functionality)
- `VITE_DATASET_API_KEY`: API key for accessing the meal logging dataset
- `VITE_DB_ID`: Database identifier for the meal logging dataset (e.g., 19158)
- `VITE_DATABASE_BASE_URL`: Base URL for TU/e Data Foundry API (ends with `/entity/`)

**Note**: The final API endpoint is constructed as: `${VITE_DATABASE_BASE_URL}${VITE_DB_ID}/${VITE_DATASET_API_KEY}`  
Example: `https://data.id.tue.nl/api/v1/datasets/entity/19158/your-api-key`

### Getting API Keys from TU/e Data Foundry

1. Visit [TU/e Data Foundry](https://data.id.tue.nl)
2. Create an account or sign in with TU/e credentials
3. Navigate to API key management in your dashboard
4. Generate keys for:
   - AI Foundry services (`VITE_AI_FOUNDRY_API_KEY`)
   - Dataset access (`VITE_DATASET_API_KEY`)
5. Add both keys to your `.env` file

### Environment File Example

```env
# AI Foundry Configuration (get from TU/e Data Foundry)
VITE_AI_FOUNDRY_API_KEY=your-ai-foundry-api-key-here
VITE_DATASET_API_KEY=your-dataset-api-key-here

# Database Configuration (get from Data Foundry Entity Dataset)
VITE_DB_ID=19158
VITE_DATABASE_BASE_URL=https://data.id.tue.nl/api/v1/datasets/entity/

# Note: All Vite environment variables must be prefixed with VITE_
# Final API URL will be: https://data.id.tue.nl/api/v1/datasets/entity/19158/your-dataset-api-key
```

## 🎯 Usage Flow

1. **Select Meal Type**: Choose breakfast, lunch, dinner, or snack
2. **Log Food**: Use text, voice, or image to describe food
3. **AI Processing**: AI identifies and asks clarifying questions
4. **Confirm Logging**: Review and confirm the food log
5. **Extra Information**: Optionally answer contextual questions
6. **Data Saving**: Food is classified and saved with NEVO groups

## 🔄 Data Flow

1. User input → AI processing → Food identification
2. Food classification → NEVO group assignment
3. Optional context questions → Data compilation
4. Final save → Database storage with classification

## 🛠️ Development

### Key Dependencies

- **React 18**: UI framework
- **React Router**: Navigation
- **Vite**: Build tool and dev server
- **React Icons**: Icon components

### API Integration

- **AI Foundry**: Text-to-text and image-to-text AI processing
- **Data Foundation API**: Data storage and retrieval
- **Speech Recognition**: Browser-native voice input

### Browser Compatibility

- **Voice Recognition**: Chrome, Safari, Edge
- **Image Capture**: Modern browsers with camera access
- **General Usage**: All modern browsers

## 🎨 Styling

- CSS custom properties for theming
- Mobile-first responsive design
- Component-scoped CSS files
- Primary color: `#88b083` (green)

## 📝 Adding New Features

### Adding New Prompts

1. Add to `src/config/prompts.json`
2. Import in components that need it
3. Use in AI function calls

### Adding New Questions

1. Edit `src/config/extraInfoQuestions.json`
2. Follow existing format with id, question, and options

### Modifying AI Behavior

1. Update relevant prompts in `prompts.json`
2. Adjust temperature/max_tokens in API calls
3. Test with various food inputs

## 🐛 Troubleshooting

### Common Issues

1. **"Please set your AI Foundry API key" or Database errors**
   - Check `.env` file exists in project root
   - Verify all required environment variables are set:
     - `VITE_AI_FOUNDRY_API_KEY`
     - `VITE_DATASET_API_KEY`
     - `VITE_DB_ID`
     - `VITE_DATABASE_BASE_URL`
   - Restart dev server after adding/changing env variables

2. **Voice recognition not working**
   - Use Chrome, Safari, or Edge browser
   - Allow microphone permissions
   - Check for HTTPS in production

3. **Image upload issues**
   - Verify camera permissions
   - Check file size limits
   - Ensure proper image formats

### Debug Mode

Set logging to `true` in AI function calls to see detailed API responses:

```javascript
const aiResponse = await foundry.textToText({
  // ... other options
  logging: true  // Enable debug logging
});
```

## 📄 License

[Add your license information here]

## 🤝 Contributing

[Add contributing guidelines here]

## 📞 Support

[Add support contact information here]
