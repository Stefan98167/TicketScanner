# TicketScanner 📱

A modern React Native mobile application for scanning and validating QR code tickets using Expo and Supabase.

## 🚀 Features

- **QR Code Scanning**: Scan QR codes using device camera
- **Manual Code Entry**: Enter ticket codes manually for validation
- **Real-time Validation**: Check ticket validity against Supabase database
- **Analytics Dashboard**: View scanning statistics and insights
- **Multi-language Support**: Internationalization (i18n) support
- **Dark/Light Theme**: Adaptive theming system
- **Cross-platform**: Works on iOS, Android, and Web

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) with React Native
- **Language**: TypeScript
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Real-time)
- **Navigation**: Expo Router
- **Camera**: Expo Camera for QR code scanning

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Supabase Account](https://supabase.com/) (for backend)

## 🔧 Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/yourusername/TicketScanner.git
   cd TicketScanner
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   **Note**: A `.env` file with test credentials has been created for development purposes.

3. **Set up Supabase Database**
   
   Create the following table in your Supabase database:
   ```sql
   CREATE TABLE tickets (
     id TEXT PRIMARY KEY,
     devalued BOOLEAN DEFAULT FALSE,
     scanned_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

## 🚀 Usage

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Web**: Press `w` in the terminal
- **Physical Device**: Scan the QR code with [Expo Go](https://expo.dev/go)

## 🔒 Security

### Environment Variables
- Never commit `.env` files to version control
- Use environment variables for sensitive configuration
- The app uses `EXPO_PUBLIC_` prefix for client-side environment variables

### GitHub Codespaces
For enhanced security when contributing, consider using [GitHub Codespaces](https://docs.github.com/en/codespaces/managing-codespaces-for-your-organization/managing-development-environment-secrets-for-your-repository-or-organization) to securely manage API keys.

### Database Security
- Enable Row Level Security (RLS) in Supabase
- Implement proper database policies
- Use prepared statements for all queries

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Remove console.log statements in production

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Device/OS information

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you need help:
- Create an issue on GitHub
- Check the [Expo documentation](https://docs.expo.dev/)
- Review the [Supabase documentation](https://supabase.com/docs)

---

**Note**: This is an open-source project. Please ensure you follow security best practices when deploying to production environments.
