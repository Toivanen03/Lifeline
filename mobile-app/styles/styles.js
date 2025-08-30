import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: { flex: 1, padding: 20 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  description: { fontSize: 20, textAlign: 'center', marginBottom: 20 },
  remark: { fontSize: 16, textAlign: 'center' },

  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
    flex: 1
  },

  footerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: 'flex-end',
  },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#007aff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    width: 100,
  },

  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
  },

  skipContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    marginBottom: 20,
  },

  buttonPlaceholder: { width: 100 },
})