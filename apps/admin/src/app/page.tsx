/**
 * Dosyanın görevi: Yönetim uygulamasının kök adresini ana dashboard ekranına yönlendirir.
 * Kullanıldığı yerler: Admin domaininin / adresi.
 */
import { redirect } from 'next/navigation';

/** Admin domainini tek ve tahmin edilebilir giriş noktasına taşır. */
export default function AdminHomePage() {
  redirect('/dashboard');
}
